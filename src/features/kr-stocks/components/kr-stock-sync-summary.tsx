import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { KrStockSyncResult } from "@/data-access/schemas/kr-stock";

interface KrStockSyncSummaryProps {
  onClose: () => void;
  result: KrStockSyncResult;
}

export function KrStockSyncSummary({
  onClose,
  result,
}: KrStockSyncSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>KR 종목과 법인명을 동기화했습니다</AlertTitle>
      <AlertDescription>
        <p>
          KRX KOSPI·KOSDAQ {result.fetchedCount.toLocaleString("ko-KR")}건을
          조회해 변경된 {result.updatedCount.toLocaleString("ko-KR")}개 종목을
          갱신했습니다.
        </p>
        <p>
          DART 법인명{" "}
          {result.corporationNameFetchedCount.toLocaleString("ko-KR")}건을
          확인해 새 이름{" "}
          {result.corporationNameInsertedCount.toLocaleString("ko-KR")}건을
          추가하고, 변경된{" "}
          {result.corporationUpdatedCount.toLocaleString("ko-KR")}개 법인을
          갱신했습니다.
        </p>
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="KR 종목·법인명 동기화 결과 닫기"
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
