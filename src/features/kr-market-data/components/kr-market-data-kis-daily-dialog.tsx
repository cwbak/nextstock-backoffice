import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock3Icon } from "lucide-react";

import { BackgroundJobStatusAlert } from "@/components/common/background-job-status-alert";
import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { useBackgroundJob } from "@/components/common/use-background-job";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import { createKisDailyMarketData } from "@/data-access/queries/kr-market-data/mutations";
import {
  krMarketDataKisDailyResultSchema,
  type KrMarketDataKisDailyResult,
} from "@/data-access/schemas/kr-market-data";
import { KrMarketDataDateRangeFields } from "@/features/kr-market-data/components/kr-market-data-date-range-fields";
import { useKrMarketDataDateRangeForm } from "@/features/kr-market-data/hooks/use-kr-market-data-date-range-form";

interface KrMarketDataKisDailyDialogProps {
  onCreated: (result: KrMarketDataKisDailyResult) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function KrMarketDataKisDailyDialog({
  onCreated,
  onOpenChange,
  open,
}: KrMarketDataKisDailyDialogProps) {
  const queryClient = useQueryClient();
  const { createSubmit, errors, register, resetForm } =
    useKrMarketDataDateRangeForm();
  const jobTracker = useBackgroundJob({
    expectedType: "stocks_kis_daily",
    resultSchema: krMarketDataKisDailyResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: krMarketDataKeys.lists(),
      });
      resetForm();
      onCreated(result);
    },
  });
  const mutation = useMutation({
    mutationFn: createKisDailyMarketData,
    onSuccess: jobTracker.track,
  });
  const isBusy = mutation.isPending || jobTracker.isTracking;
  const submitForm = createSubmit((payload) => {
    jobTracker.reset();
    mutation.reset();
    mutation.mutate(payload);
  });

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && !isBusy) {
      mutation.reset();
      jobTracker.reset();
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KIS 전 종목 기간 일봉 저장</DialogTitle>
          <DialogDescription>
            등록된 모든 KR 종목에 같은 기간을 적용해 KIS 일봉을 ClickHouse에
            저장합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>Worker가 종목 코드순으로 처리합니다</AlertTitle>
          <AlertDescription>
            한 종목이 실패해도 다음 종목을 계속 처리합니다. 진행 상태를 2초마다
            확인하며, 창을 닫아도 백그라운드 작업은 계속됩니다.
          </AlertDescription>
        </Alert>
        {jobTracker.jobId !== null && jobTracker.isTracking ? (
          <BackgroundJobStatusAlert
            job={jobTracker.job}
            jobId={jobTracker.jobId}
          />
        ) : null}
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => void submitForm(event)}
        >
          <KrMarketDataDateRangeFields
            fromError={errors.from}
            fromRegistration={register("from")}
            idPrefix="save-kis-daily-market-data"
            toError={errors.to}
            toRegistration={register("to")}
          />
          {jobTracker.errorMessage || mutation.isError ? (
            <MutationErrorAlert
              message={
                jobTracker.errorMessage ?? getErrorMessage(mutation.error)
              }
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changeOpen(false)}
            >
              {isBusy ? "닫기" : "취소"}
            </Button>
            <Button disabled={isBusy} type="submit">
              {isBusy ? <Spinner data-icon="inline-start" /> : null}
              {isBusy ? "KIS 작업 처리 중" : "KIS 전 종목 저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
