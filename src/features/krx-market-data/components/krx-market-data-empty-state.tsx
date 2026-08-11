import { ChartCandlestickIcon, ListFilterIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface KrxMarketDataEmptyStateProps {
  mode: "not-searched" | "no-results";
}

export function KrxMarketDataEmptyState({
  mode,
}: KrxMarketDataEmptyStateProps) {
  const notSearched = mode === "not-searched";

  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {notSearched ? (
            <ListFilterIcon aria-hidden="true" />
          ) : (
            <ChartCandlestickIcon aria-hidden="true" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {notSearched
            ? "조회할 KRX 종목을 선택해 주세요"
            : "조회된 캔들이 없습니다"}
        </EmptyTitle>
        <EmptyDescription>
          {notSearched
            ? "종목과 캔들 주기를 선택하면 현재 일자 기준으로 조회합니다."
            : "선택한 종목과 주기에 저장된 캔들이 없습니다."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
