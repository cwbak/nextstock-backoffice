import { CalendarDaysIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function CalendarEventsEmptyState() {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarDaysIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 일정이 없습니다</EmptyTitle>
        <EmptyDescription>
          표시할 경제지표 또는 기업 실적 일정이 없습니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
