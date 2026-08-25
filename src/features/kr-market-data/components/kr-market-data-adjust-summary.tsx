import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { KrMarketDataAdjustResult } from "@/data-access/schemas/kr-market-data";

interface KrMarketDataAdjustSummaryProps {
  onClose: () => void;
  result: KrMarketDataAdjustResult;
  stockLabel: string;
}

export function KrMarketDataAdjustSummary({
  onClose,
  result,
  stockLabel,
}: KrMarketDataAdjustSummaryProps) {
  const hasChanges = result.copiedCount > 0 || result.adjustedCount > 0;

  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>{stockLabel} 수정주가를 반영했습니다</AlertTitle>
      <AlertDescription>
        {hasChanges
          ? `원본주가에서 신규 ${result.copiedCount.toLocaleString("ko-KR")}거래일을 복사했고, 조정으로 OHLC 또는 거래량이 실제로 달라진 캔들 ${result.adjustedCount.toLocaleString("ko-KR")}건을 반영했습니다.`
          : "추가로 복사하거나 조정할 캔들이 없습니다."}
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="수정주가 반영 결과 닫기"
          size="icon-sm"
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
