import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
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
  const mutation = useMutation({
    mutationKey: sectorKeys.writes(),
    mutationFn: synchronizeSectors,
    retry: false,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: sectorKeys.all });
      queryClient.removeQueries({ queryKey: sectorKeys.details() });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
    },
  });

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) sectorUiActions.closeSync();
      }}
    >
      <AlertDialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (mutation.isPending) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>섹터 동기화</AlertDialogTitle>
          <AlertDialogDescription>
            Toss에서 최신 섹터 목록을 가져와 전체 섹터를 맞춥니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isSuccess ? (
          <SectorSyncResultSummary result={mutation.data} />
        ) : (
          <SectorSyncNotice />
        )}
        {mutation.isPending ? <SectorSyncProgress /> : null}
        {mutation.isError ? (
          <MutationErrorAlert
            title="섹터를 동기화하지 못했습니다"
            message={getErrorMessage(mutation.error)}
          />
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={mutation.isPending}
            type="button"
            variant="outline"
          >
            {mutation.isSuccess ? "닫기" : "취소"}
          </AlertDialogCancel>
          {!mutation.isSuccess ? (
            <AlertDialogAction
              disabled={mutation.isPending}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              {mutation.isPending ? (
                <Spinner aria-hidden="true" data-icon="inline-start" />
              ) : (
                <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
              )}
              {mutation.isPending
                ? "동기화 중"
                : mutation.isError
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
