import { PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

export function SectorsPageActions({
  isFetching,
  onRefresh,
}: {
  isFetching: boolean;
  onRefresh: () => void;
}) {
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
      <Button type="button" onClick={() => sectorUiActions.create()}>
        <PlusIcon aria-hidden="true" data-icon="inline-start" />
        섹터 추가
      </Button>
    </>
  );
}
