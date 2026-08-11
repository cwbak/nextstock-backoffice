import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { KrxMarketDataCreateResult } from "@/data-access/schemas/krx-market-data";

interface KrxMarketDataSaveSummaryProps {
  from: string;
  onClose: () => void;
  result: KrxMarketDataCreateResult;
  stockLabel: string;
  to: string;
}

export function KrxMarketDataSaveSummary({
  from,
  onClose,
  result,
  stockLabel,
  to,
}: KrxMarketDataSaveSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>{stockLabel} 일봉을 반영했습니다</AlertTitle>
      <AlertDescription>
        {from}–{to} 기간의 고유 일봉{" "}
        {result.fetchedCount.toLocaleString("ko-KR")}
        건을 조회해 {result.insertedCount.toLocaleString("ko-KR")}건을 새로
        저장했습니다.
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="KRX 일봉 저장 결과 닫기"
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
