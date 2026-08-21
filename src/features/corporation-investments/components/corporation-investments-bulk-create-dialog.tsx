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
import { equityInvestmentKeys } from "@/data-access/queries/equity-investments/keys";
import { createAllEquityInvestments } from "@/data-access/queries/equity-investments/mutations";
import {
  equityInvestmentBulkCreateResultSchema,
  type EquityInvestmentBulkCreateResult,
} from "@/data-access/schemas/equity-investment";

interface CorporationInvestmentsBulkCreateDialogProps {
  corporationCount: number;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: EquityInvestmentBulkCreateResult) => void;
  open: boolean;
}

export function CorporationInvestmentsBulkCreateDialog({
  corporationCount,
  onOpenChange,
  onCreated,
  open,
}: CorporationInvestmentsBulkCreateDialogProps) {
  const queryClient = useQueryClient();
  const jobTracker = useBackgroundJob({
    expectedType: "equity_investments_all",
    resultSchema: equityInvestmentBulkCreateResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: equityInvestmentKeys.all,
      });
      onCreated(result);
    },
  });
  const mutation = useMutation({
    mutationFn: createAllEquityInvestments,
    onSuccess: jobTracker.track,
  });
  const isBusy = mutation.isPending || jobTracker.isTracking;

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && !isBusy) {
      mutation.reset();
      jobTracker.reset();
    }
    onOpenChange(nextOpen);
  };

  const synchronizeAll = () => {
    jobTracker.reset();
    mutation.reset();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>전체 법인 출자현황 동기화</DialogTitle>
          <DialogDescription>
            등록된 모든 법인의 최신 출자현황 스냅샷을 DART에서 동기화합니다.
            조회할 보고서는 서버가 현재 시점에 맞춰 결정합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>
            {corporationCount.toLocaleString("ko-KR")}개 법인을 순차 처리합니다
          </AlertTitle>
          <AlertDescription>
            Worker가 백그라운드에서 처리합니다. 일부 법인이 실패해도 나머지는
            계속 처리되며 진행 상태를 2초마다 확인합니다.
          </AlertDescription>
        </Alert>
        {jobTracker.jobId !== null && jobTracker.isTracking ? (
          <BackgroundJobStatusAlert
            job={jobTracker.job}
            jobId={jobTracker.jobId}
          />
        ) : null}
        {jobTracker.errorMessage || mutation.isError ? (
          <MutationErrorAlert
            message={jobTracker.errorMessage ?? getErrorMessage(mutation.error)}
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
          <Button disabled={isBusy} type="button" onClick={synchronizeAll}>
            {isBusy ? <Spinner data-icon="inline-start" /> : null}
            {isBusy ? "동기화 중" : "전체 동기화"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
