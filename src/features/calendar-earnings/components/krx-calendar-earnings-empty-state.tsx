import { CalendarClockIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function KrxCalendarEarningsEmptyState() {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarClockIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 KRX 실적 일정이 없습니다</EmptyTitle>
        <EmptyDescription>
          표시할 KOSPI 또는 KOSDAQ 실적 일정이 없습니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
