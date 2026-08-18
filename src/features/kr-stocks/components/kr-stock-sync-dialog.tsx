import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudDownloadIcon } from "lucide-react";

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
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { syncKrStocks } from "@/data-access/queries/kr-stocks/mutations";
import {
  krStockSyncResultSchema,
  type KrStockSyncResult,
} from "@/data-access/schemas/kr-stock";

interface KrStockSyncDialogProps {
  onOpenChange: (open: boolean) => void;
  onSynced: (result: KrStockSyncResult) => void;
  open: boolean;
}

export function KrStockSyncDialog({
  onOpenChange,
  onSynced,
  open,
}: KrStockSyncDialogProps) {
  const queryClient = useQueryClient();
  const jobTracker = useBackgroundJob({
    expectedType: "kr_stocks_sync",
    resultSchema: krStockSyncResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({ queryKey: krStockKeys.all });
      onSynced(result);
    },
  });
  const mutation = useMutation({
    mutationFn: syncKrStocks,
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

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>KR 종목 KRX 동기화</DialogTitle>
          <DialogDescription>
            KRX KOSPI·KOSDAQ 기본정보로 등록된 KR 종목을 갱신합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <CloudDownloadIcon aria-hidden="true" />
          <AlertTitle>종목명·액면가·상장주식수를 동기화합니다</AlertTitle>
          <AlertDescription>
            DB에 이미 등록된 종목만 갱신하며, KRX에만 존재하는 종목은 새로
            추가하지 않습니다. 두 시장의 전체 응답을 검증한 뒤 한 번에
            반영합니다.
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
          <Button
            disabled={isBusy}
            type="button"
            onClick={() => {
              jobTracker.reset();
              mutation.reset();
              mutation.mutate();
            }}
          >
            {isBusy ? <Spinner data-icon="inline-start" /> : null}
            {isBusy ? "작업 처리 중" : "동기화"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
