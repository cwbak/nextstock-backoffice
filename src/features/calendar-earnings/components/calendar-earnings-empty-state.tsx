import { CalendarClockIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface CalendarEarningsEmptyStateProps {
  onCreate: () => void;
}

export function CalendarEarningsEmptyState({
  onCreate,
}: CalendarEarningsEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarClockIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 실적 일정이 없습니다</EmptyTitle>
        <EmptyDescription>
          Alpha Vantage에서 NASDAQ 실적 일정을 가져와 등록할 수 있습니다.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onCreate}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          NASDAQ 일정 추가
        </Button>
      </EmptyContent>
    </Empty>
  );
}
