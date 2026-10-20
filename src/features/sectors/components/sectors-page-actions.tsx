import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

export function SectorsPageActions({
  isFetching,
  onRefresh,
}: {
  isFetching: boolean;
  onRefresh: () => void;
}) {
  const isWriting = useIsMutating({ mutationKey: sectorKeys.writes() }) > 0;
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
        disabled={isWriting}
        type="button"
        variant="outline"
        onClick={sectorUiActions.openSync}
      >
        <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        동기화
      </Button>
      <Button
        disabled={isWriting}
        type="button"
        onClick={() => sectorUiActions.create()}
      >
        <PlusIcon aria-hidden="true" data-icon="inline-start" />
        섹터 추가
      </Button>
    </>
  );
}
