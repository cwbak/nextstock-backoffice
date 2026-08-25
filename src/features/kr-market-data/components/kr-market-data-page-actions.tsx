import {
  CloudDownloadIcon,
  DatabaseIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface KrMarketDataPageActionsProps {
  canAdjustStock: boolean;
  canRefresh: boolean;
  canSaveStock: boolean;
  isRefreshing: boolean;
  onAdjustStock: () => void;
  onRefresh: () => void;
  onSaveAll: () => void;
  onSaveKisDaily: () => void;
  onSaveStock: () => void;
}

export function KrMarketDataPageActions({
  canAdjustStock,
  canRefresh,
  canSaveStock,
  isRefreshing,
  onAdjustStock,
  onRefresh,
  onSaveAll,
  onSaveKisDaily,
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
      <Button disabled={!canAdjustStock} type="button" onClick={onAdjustStock}>
        <SlidersHorizontalIcon aria-hidden="true" data-icon="inline-start" />
        수정주가 반영
      </Button>
      <Button type="button" onClick={onSaveAll}>
        <CloudDownloadIcon aria-hidden="true" data-icon="inline-start" />
        KRX 일자별 저장
      </Button>
      <Button type="button" onClick={onSaveKisDaily}>
        <CloudDownloadIcon aria-hidden="true" data-icon="inline-start" />
        KIS 전 종목 저장
      </Button>
    </>
  );
}
