import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { getErrorMessage } from "@/data-access/api/client";
import { backgroundJobQueryOptions } from "@/data-access/queries/background-jobs/queries";
import type {
  BackgroundJobRegistration,
  BackgroundJobType,
} from "@/data-access/schemas/background-job";

interface UseBackgroundJobOptions<TResult> {
  expectedType: BackgroundJobType;
  resultSchema: z.ZodType<TResult>;
  onCompleted: (result: TResult) => Promise<void> | void;
}

export function useBackgroundJob<TResult>({
  expectedType,
  onCompleted,
  resultSchema,
}: UseBackgroundJobOptions<TResult>) {
  const [jobId, setJobId] = useState<number | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const handledJobIdRef = useRef<number | null>(null);
  const jobQuery = useQuery({
    ...backgroundJobQueryOptions(jobId ?? 0),
    enabled: jobId !== null,
  });
  const job = jobQuery.data;
  const completedResult =
    job?.type === expectedType && job.status === "COMPLETED"
      ? resultSchema.safeParse(job.result)
      : null;

  useEffect(() => {
    if (
      !job ||
      !completedResult?.success ||
      handledJobIdRef.current === job.jobId
    ) {
      return;
    }

    const completedJobId = job.jobId;
    handledJobIdRef.current = completedJobId;
    void Promise.resolve()
      .then(() => onCompleted(completedResult.data))
      .catch((error: unknown) => {
        if (handledJobIdRef.current === completedJobId) {
          setTerminalError(getErrorMessage(error));
        }
      });
  }, [completedResult, job, onCompleted]);

  const reset = () => {
    handledJobIdRef.current = null;
    setJobId(null);
    setTerminalError(null);
  };

  const track = (registration: BackgroundJobRegistration) => {
    handledJobIdRef.current = null;
    setTerminalError(null);

    if (registration.type !== expectedType) {
      setTerminalError("등록된 작업 종류가 요청과 다릅니다.");
      return;
    }
    setJobId(registration.jobId);
  };

  const jobErrorMessage = !job
    ? null
    : job.type !== expectedType
      ? "요청한 작업과 조회된 작업 종류가 다릅니다."
      : job.status === "FAILED"
        ? (job.error ?? "백그라운드 작업에 실패했습니다.")
        : job.status === "COMPLETED" && !completedResult?.success
          ? "완료된 작업 결과가 API 명세와 다릅니다."
          : null;
  const status = job?.status;
  const isTracking =
    jobId !== null &&
    terminalError === null &&
    jobErrorMessage === null &&
    !jobQuery.isError &&
    status !== "COMPLETED" &&
    status !== "FAILED";
  const errorMessage = terminalError
    ? terminalError
    : jobErrorMessage
      ? jobErrorMessage
      : jobQuery.isError
        ? getErrorMessage(jobQuery.error)
        : null;

  return {
    errorMessage,
    isTracking,
    job,
    jobId,
    reset,
    track,
  };
}
