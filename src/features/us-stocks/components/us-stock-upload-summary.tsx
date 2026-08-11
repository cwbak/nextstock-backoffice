import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { UsStockUploadResult } from "@/data-access/schemas/us-stock";

interface UsStockUploadSummaryProps {
  onClose: () => void;
  result: UsStockUploadResult;
}

export function UsStockUploadSummary({
  onClose,
  result,
}: UsStockUploadSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>US 종목 정보 CSV를 반영했습니다</AlertTitle>
      <AlertDescription>
        처리 {result.processedCount.toLocaleString("ko-KR")}건 중 신규 또는
        변경된 {result.upsertedCount.toLocaleString("ko-KR")}건을 반영했습니다.
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="CSV 반영 결과 닫기"
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
