import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { BackgroundJobStatusAlert } from "@/components/common/background-job-status-alert";
import { useBackgroundJob } from "@/components/common/use-background-job";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { synchronizeSectors } from "@/data-access/queries/sectors/mutations";
import { sectorSyncResultSchema } from "@/data-access/schemas/sector";
import {
  SectorSyncNotice,
  SectorSyncProgress,
  SectorSyncResultSummary,
} from "@/features/sectors/components/sector-sync-report";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

function SectorSyncSession() {
  const queryClient = useQueryClient();
  const jobTracker = useBackgroundJob({
    expectedType: "sectors_sync",
    resultSchema: sectorSyncResultSchema,
    onCompleted: async () => {
      await queryClient.cancelQueries({ queryKey: sectorKeys.all });
      queryClient.removeQueries({ queryKey: sectorKeys.details() });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
    },
  });
  const mutation = useMutation({
    mutationKey: sectorKeys.writes(),
    mutationFn: synchronizeSectors,
    retry: false,
    onSuccess: jobTracker.track,
  });
  const isBusy = mutation.isPending || jobTracker.isTracking;
  const errorMessage =
    jobTracker.errorMessage ??
    (mutation.isError ? getErrorMessage(mutation.error) : null);

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isBusy) sectorUiActions.closeSync();
      }}
    >
      <AlertDialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isBusy) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>섹터 동기화</AlertDialogTitle>
          <AlertDialogDescription>
            Toss의 최신 섹터와 구성 종목을 백그라운드에서 동기화합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {jobTracker.result ? (
          <SectorSyncResultSummary result={jobTracker.result} />
        ) : (
          <SectorSyncNotice />
        )}
        {mutation.isPending ? <SectorSyncProgress /> : null}
        {jobTracker.jobId !== null && jobTracker.isTracking ? (
          <BackgroundJobStatusAlert
            job={jobTracker.job}
            jobId={jobTracker.jobId}
          />
        ) : null}
        {mutation.data?.created === false && jobTracker.isTracking ? (
          <p className="text-sm text-muted-foreground">
            이미 진행 중인 동기화 작업을 확인하고 있습니다.
          </p>
        ) : null}
        {errorMessage ? (
          <MutationErrorAlert
            title="섹터를 동기화하지 못했습니다"
            message={errorMessage}
          />
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy} type="button" variant="outline">
            {jobTracker.result ? "닫기" : "취소"}
          </AlertDialogCancel>
          {!jobTracker.result ? (
            <AlertDialogAction
              disabled={isBusy}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                jobTracker.reset();
                mutation.mutate();
              }}
            >
              {isBusy ? (
                <Spinner aria-hidden="true" data-icon="inline-start" />
              ) : (
                <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
              )}
              {isBusy
                ? "동기화 중"
                : errorMessage
                  ? "다시 시도"
                  : "동기화 실행"}
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SectorSyncDialog() {
  const open = useSectorUiStore((state) => state.syncOpen);
  return open ? <SectorSyncSession /> : null;
}
