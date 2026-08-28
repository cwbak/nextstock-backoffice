import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { HolidaySyncResult } from "@/data-access/schemas/holiday";

interface HolidaySyncSummaryProps {
  onClose: () => void;
  result: HolidaySyncResult;
}

export function HolidaySyncSummary({
  onClose,
  result,
}: HolidaySyncSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>공휴일 동기화를 완료했습니다</AlertTitle>
      <AlertDescription>
        공공데이터포털에서 공휴일 {result.fetchedCount.toLocaleString("ko-KR")}
        건을 조회해 {result.upsertedCount.toLocaleString("ko-KR")}건을
        저장했습니다.
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="공휴일 동기화 결과 닫기"
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
