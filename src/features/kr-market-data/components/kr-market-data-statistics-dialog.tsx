import { useMutation } from "@tanstack/react-query";
import { ChartNoAxesCombinedIcon, Clock3Icon } from "lucide-react";

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
import { generateKrMarketDataStatistics } from "@/data-access/queries/kr-market-data/mutations";
import {
  krMarketDataStatisticsResultSchema,
  type KrMarketDataStatisticsResult,
} from "@/data-access/schemas/kr-market-data";

interface KrMarketDataStatisticsDialogProps {
  onGenerated: (result: KrMarketDataStatisticsResult) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function KrMarketDataStatisticsDialog({
  onGenerated,
  onOpenChange,
  open,
}: KrMarketDataStatisticsDialogProps) {
  const jobTracker = useBackgroundJob({
    expectedType: "stocks_market_data_statistics_generate",
    resultSchema: krMarketDataStatisticsResultSchema,
    onCompleted: onGenerated,
  });
  const mutation = useMutation({
    mutationFn: generateKrMarketDataStatistics,
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

  const generate = () => {
    jobTracker.reset();
    mutation.reset();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KR 전 종목 수정주가 통계 반영</DialogTitle>
          <DialogDescription>
            모든 KR 종목의 수정주가를 전체 재집계해 종목별 통계를 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <ChartNoAxesCombinedIcon aria-hidden="true" />
          <AlertTitle>52주·역대 고가와 저가를 다시 계산합니다</AlertTitle>
          <AlertDescription>
            각 종목의 최신 수정주가 날짜를 기준으로 계산하며, 가격이 0인 행은
            해당 통계에서 제외합니다.
          </AlertDescription>
        </Alert>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>Worker가 전체 종목을 처리합니다</AlertTitle>
          <AlertDescription>
            진행 상태를 2초마다 확인하며, 창을 닫아도 백그라운드 작업은
            계속됩니다.
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
            title="수정주가 통계를 반영하지 못했습니다"
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
          <Button disabled={isBusy} type="button" onClick={generate}>
            {isBusy ? <Spinner data-icon="inline-start" /> : null}
            {isBusy ? "수정주가 통계 처리 중" : "수정주가 통계 반영"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
