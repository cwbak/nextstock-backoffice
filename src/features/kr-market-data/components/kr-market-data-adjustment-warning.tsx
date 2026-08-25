import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function KrMarketDataAdjustmentWarning() {
  return (
    <Alert>
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>원본주가의 전일대비를 먼저 확인하세요</AlertTitle>
      <AlertDescription>
        전일대비가 누락되어 0으로 저장된 원본 데이터는 일반 가격 변동을
        액면분할·병합으로 오인할 수 있습니다. 대상 종목의 전체 수정주가가 다시
        계산될 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}
