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
import { adjustAllKrMarketData } from "@/data-access/queries/kr-market-data/mutations";
import {
  krMarketDataAdjustAllResultSchema,
  type KrMarketDataAdjustAllResult,
} from "@/data-access/schemas/kr-market-data";
import { KrMarketDataAdjustmentWarning } from "@/features/kr-market-data/components/kr-market-data-adjustment-warning";

interface KrMarketDataAdjustAllDialogProps {
  onAdjusted: (result: KrMarketDataAdjustAllResult) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function KrMarketDataAdjustAllDialog({
  onAdjusted,
  onOpenChange,
  open,
}: KrMarketDataAdjustAllDialogProps) {
  const queryClient = useQueryClient();
  const jobTracker = useBackgroundJob({
    expectedType: "stocks_market_data_adjust",
    resultSchema: krMarketDataAdjustAllResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: krMarketDataKeys.lists(),
      });
      onAdjusted(result);
    },
  });
  const mutation = useMutation({
    mutationFn: adjustAllKrMarketData,
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

  const adjustAll = () => {
    jobTracker.reset();
    mutation.reset();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KR 전 종목 수정주가 반영</DialogTitle>
          <DialogDescription>
            등록된 모든 KR 종목의 원본주가를 수정주가에 증분 반영합니다.
          </DialogDescription>
        </DialogHeader>
        <KrMarketDataAdjustmentWarning />
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
        {jobTracker.errorMessage || mutation.isError ? (
          <MutationErrorAlert
            message={jobTracker.errorMessage ?? getErrorMessage(mutation.error)}
            title="전 종목 수정주가를 반영하지 못했습니다"
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
          <Button disabled={isBusy} type="button" onClick={adjustAll}>
            {isBusy ? <Spinner data-icon="inline-start" /> : null}
            {isBusy ? "전체 수정주가 처리 중" : "전체 수정주가 반영"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
