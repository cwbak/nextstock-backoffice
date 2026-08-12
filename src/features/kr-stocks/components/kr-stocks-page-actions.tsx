import { CloudDownloadIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface KrStocksPageActionsProps {
  isFetching: boolean;
  onRefresh: () => void;
  onSync: () => void;
  onUpsert: () => void;
}

export function KrStocksPageActions({
  isFetching,
  onRefresh,
  onSync,
  onUpsert,
}: KrStocksPageActionsProps) {
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
      <Button type="button" onClick={onSync}>
        <CloudDownloadIcon aria-hidden="true" data-icon="inline-start" />
        KRX 동기화
      </Button>
      <Button type="button" onClick={onUpsert}>
        <PlusIcon aria-hidden="true" data-icon="inline-start" />
        종목 생성·갱신
      </Button>
    </>
  );
}
