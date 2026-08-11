import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CreateUsCalendarEarningsResult } from "@/data-access/schemas/us-calendar-earning";

interface UsCalendarEarningsCreateSummaryProps {
  onClose: () => void;
  result: CreateUsCalendarEarningsResult;
}

export function UsCalendarEarningsCreateSummary({
  onClose,
  result,
}: UsCalendarEarningsCreateSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>US 실적 일정을 반영했습니다</AlertTitle>
      <AlertDescription>
        조회 {result.fetchedCount.toLocaleString("ko-KR")}건 중{" "}
        {result.insertedCount.toLocaleString("ko-KR")}건을 추가하고{" "}
        {result.skippedCount.toLocaleString("ko-KR")}건을 건너뛰었습니다.
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="US 실적 일정 추가 결과 닫기"
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
