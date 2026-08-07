import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CreateNasdaqCalendarEarningsResult } from "@/data-access/schemas/calendar-earning";

interface CalendarEarningsCreateSummaryProps {
  onClose: () => void;
  result: CreateNasdaqCalendarEarningsResult;
}

export function CalendarEarningsCreateSummary({
  onClose,
  result,
}: CalendarEarningsCreateSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>NASDAQ 실적 일정을 반영했습니다</AlertTitle>
      <AlertDescription>
        조회 {result.fetchedCount.toLocaleString("ko-KR")}건 중{" "}
        {result.insertedCount.toLocaleString("ko-KR")}건을 추가하고{" "}
        {result.skippedCount.toLocaleString("ko-KR")}건을 건너뛰었습니다.
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="NASDAQ 실적 일정 추가 결과 닫기"
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
