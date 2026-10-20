import { PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { themeSyncActions } from "@/features/themes/stores/use-theme-sync-store";

interface ThemesPageActionsProps {
  isFetching: boolean;
  onCreate: () => void;
  onRefresh: () => void;
}

export function ThemesPageActions({
  isFetching,
  onCreate,
  onRefresh,
}: ThemesPageActionsProps) {
  return (
    <>
      <Button
        disabled={isFetching}
        type="button"
        variant="outline"
        onClick={onRefresh}
      >
        {isFetching ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        )}
        새로고침
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => themeSyncActions.setOpen(true)}
      >
        <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        동기화
      </Button>
      <Button type="button" onClick={onCreate}>
        <PlusIcon aria-hidden="true" data-icon="inline-start" />
        테마 추가
      </Button>
    </>
  );
}
