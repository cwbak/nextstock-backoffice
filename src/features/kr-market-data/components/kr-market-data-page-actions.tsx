import { CloudDownloadIcon, DatabaseIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface KrMarketDataPageActionsProps {
  canRefresh: boolean;
  canSaveStock: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSaveAll: () => void;
  onSaveStock: () => void;
}

export function KrMarketDataPageActions({
  canRefresh,
  canSaveStock,
  isRefreshing,
  onRefresh,
  onSaveAll,
  onSaveStock,
}: KrMarketDataPageActionsProps) {
  return (
    <>
      <Button
        disabled={!canRefresh || isRefreshing}
        type="button"
        variant="outline"
        onClick={onRefresh}
      >
        {isRefreshing ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        )}
        새로고침
      </Button>
      <Button disabled={!canSaveStock} type="button" onClick={onSaveStock}>
        <DatabaseIcon aria-hidden="true" data-icon="inline-start" />
        일봉 저장
      </Button>
      <Button type="button" onClick={onSaveAll}>
        <CloudDownloadIcon aria-hidden="true" data-icon="inline-start" />
        KRX 일자별 저장
      </Button>
    </>
  );
}
