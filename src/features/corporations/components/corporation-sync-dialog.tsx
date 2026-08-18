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
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { syncCorporations } from "@/data-access/queries/corporations/mutations";
import {
  corporationSyncResultSchema,
  type CorporationSyncResult,
} from "@/data-access/schemas/corporation";

interface CorporationSyncDialogProps {
  onOpenChange: (open: boolean) => void;
  onSynced: (result: CorporationSyncResult) => void;
  open: boolean;
}

export function CorporationSyncDialog({
  onOpenChange,
  onSynced,
  open,
}: CorporationSyncDialogProps) {
  const queryClient = useQueryClient();
  const jobTracker = useBackgroundJob({
    expectedType: "corporations_sync",
    resultSchema: corporationSyncResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({ queryKey: corporationKeys.all });
      onSynced(result);
    },
  });
  const mutation = useMutation({
    mutationFn: syncCorporations,
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
          <DialogTitle>DART 법인·법인명 동기화</DialogTitle>
          <DialogDescription>
            법인명 원장을 갱신한 뒤 등록된 모든 법인의 기업개황을 동기화합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <CloudDownloadIcon aria-hidden="true" />
          <AlertTitle>법인명과 등록된 법인 기본정보를 동기화합니다</AlertTitle>
          <AlertDescription>
            법인 코드와 정규화된 이름 조합이 없으면 법인명 원장에 추가합니다.
            모든 기업개황 조회가 성공하면 실제 값이 변경된 법인만 일괄 갱신하며,
            기존 부가 정보는 유지합니다.
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
