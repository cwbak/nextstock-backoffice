import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  KrMarketDataCreateResult,
  KrMarketDataKisDailyResult,
} from "@/data-access/schemas/kr-market-data";

interface KrMarketDataSaveSummaryProps {
  from: string;
  onClose: () => void;
  result: KrMarketDataCreateResult | KrMarketDataKisDailyResult;
  stockLabel: string;
  to: string;
}

export function KrMarketDataSaveSummary({
  from,
  onClose,
  result,
  stockLabel,
  to,
}: KrMarketDataSaveSummaryProps) {
  const isKisDailyResult = "stockCount" in result;

  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>
        {isKisDailyResult
          ? `${stockLabel} 일봉 작업을 완료했습니다`
          : `${stockLabel} 일봉을 반영했습니다`}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-1">
        <span>
          {from}–{to} 기간의 고유 일봉{" "}
          {result.fetchedCount.toLocaleString("ko-KR")}
          건을 조회해 {result.insertedCount.toLocaleString("ko-KR")}건을 새로
          저장했습니다.
        </span>
        {isKisDailyResult ? (
          <span>
            대상 {result.stockCount.toLocaleString("ko-KR")}개 종목 · 성공{" "}
            {result.processedCount.toLocaleString("ko-KR")}개 · 실패{" "}
            {result.failedCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="KR 일봉 저장 결과 닫기"
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
