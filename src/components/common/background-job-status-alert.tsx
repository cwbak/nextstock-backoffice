import { Clock3Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { BackgroundJob } from "@/data-access/schemas/background-job";

const stageLabels: Readonly<Record<string, string>> = {
  FETCHING_COMPANIES: "기업개황 조회",
  FETCHING_CORPORATION_CODES: "DART 고유번호 조회",
  FETCHING_KOSDAQ: "KOSDAQ 종목 조회",
  FETCHING_KOSPI: "KOSPI 종목 조회",
  PROCESSING_CORPORATIONS: "법인별 출자현황 처리",
  SAVING_CORPORATIONS: "법인 정보 저장",
  SAVING_CORPORATION_NAMES: "법인명 저장",
  UPDATING_STOCKS: "KR 종목 갱신",
};

interface BackgroundJobStatusAlertProps {
  job: BackgroundJob | undefined;
  jobId: number;
}

export function BackgroundJobStatusAlert({
  job,
  jobId,
}: BackgroundJobStatusAlertProps) {
  const isQueued = !job || job.status === "QUEUED";
  const progress = job?.progress;
  const stage = job?.stage ? (stageLabels[job.stage] ?? job.stage) : null;

  return (
    <Alert aria-live="polite">
      <Clock3Icon aria-hidden="true" />
      <AlertTitle>
        {isQueued ? "Worker 처리 대기 중" : "작업 처리 중"}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>
          작업 #{jobId.toLocaleString("ko-KR")}
          {stage ? ` · ${stage}` : ""}
        </span>
        {progress?.percent !== null && progress?.percent !== undefined ? (
          <>
            <progress
              aria-label="백그라운드 작업 진행률"
              className="h-2 w-full accent-primary"
              max={100}
              value={progress.percent}
            />
            <span className="font-mono text-xs tabular-nums">
              {progress.current.toLocaleString("ko-KR")} /{" "}
              {progress.total?.toLocaleString("ko-KR")} ·{" "}
              {progress.percent.toLocaleString("ko-KR", {
                maximumFractionDigits: 1,
              })}
              %
            </span>
          </>
        ) : null}
        {progress && (progress.succeeded > 0 || progress.failed > 0) ? (
          <span className="text-xs">
            성공 {progress.succeeded.toLocaleString("ko-KR")} · 실패{" "}
            {progress.failed.toLocaleString("ko-KR")}
          </span>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
