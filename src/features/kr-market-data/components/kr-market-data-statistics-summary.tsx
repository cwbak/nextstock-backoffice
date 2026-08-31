import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { KrMarketDataStatisticsResult } from "@/data-access/schemas/kr-market-data";

interface KrMarketDataStatisticsSummaryProps {
  onClose: () => void;
  result: KrMarketDataStatisticsResult;
}

export function KrMarketDataStatisticsSummary({
  onClose,
  result,
}: KrMarketDataStatisticsSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>KR 수정주가 통계를 반영했습니다</AlertTitle>
      <AlertDescription>
        {result.stockCount === 0
          ? "계산할 수정주가 원본이 없습니다."
          : `${result.stockCount.toLocaleString("ko-KR")}개 종목의 통계를 계산해 ${result.storedCount.toLocaleString("ko-KR")}개 종목을 새 버전으로 저장했습니다.`}
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="수정주가 통계 반영 결과 닫기"
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
