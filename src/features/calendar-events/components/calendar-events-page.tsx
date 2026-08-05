import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import {
  type DataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { calendarEventsQueryOptions } from "@/data-access/queries/calendar-events/queries";
import { CalendarEventsEmptyState } from "@/features/calendar-events/components/calendar-events-empty-state";
import { CalendarEventsTable } from "@/features/calendar-events/components/calendar-events-table";

const pageSize = 50;
const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

const eventTypeSearchLabels = {
  EARNINGS: "실적",
  INDICATOR: "경제지표",
} as const;

const importanceSearchLabels = {
  low: "낮음",
  medium: "보통",
  high: "높음",
} as const;

export function CalendarEventsPage() {
  const calendarEventsQuery = useSuspenseQuery(calendarEventsQueryOptions);
  const {
    state: tableState,
    updatePage,
    updateQuery,
  } = useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const filteredItems = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("ko-KR");

    if (!query) {
      return calendarEventsQuery.data;
    }

    return calendarEventsQuery.data.filter((item) =>
      [
        item.id.toString(),
        item.eventDate,
        item.countryCode,
        item.eventType,
        eventTypeSearchLabels[item.eventType],
        item.title,
        item.titleEn ?? "",
        item.eventTime ?? "종일",
        item.timezone ?? "",
        item.importance,
        importanceSearchLabels[item.importance],
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query)),
    );
  }, [calendarEventsQuery.data, filterQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <section className="flex flex-col gap-6">
      <DataPageHeader
        actions={
          <Button
            disabled={calendarEventsQuery.isFetching}
            type="button"
            variant="outline"
            onClick={() => void calendarEventsQuery.refetch()}
          >
            {calendarEventsQuery.isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
            )}
            새로고침
          </Button>
        }
        description="경제지표와 기업 실적 일정을 날짜와 시간 순서로 조회합니다."
        eyebrow="Calendar"
        recordCount={calendarEventsQuery.data.length}
        title="일정"
      />
      <DataTableToolbar
        label="일정 검색"
        placeholder="날짜, 국가, 유형, 중요도, 제목 검색"
        query={tableState.q}
        onFilterChange={updateFilterQuery}
        onQueryChange={updateQuery}
      />
      <DataTableCard
        description="같은 날짜에는 종일 일정이 먼저 표시되며, 이후 시간 순서로 표시됩니다."
        recordCount={filteredItems.length}
        title="캘린더 일정"
      >
        {calendarEventsQuery.data.length === 0 ? (
          <CalendarEventsEmptyState />
        ) : filteredItems.length === 0 ? (
          <NoSearchResults
            query={filterQuery}
            onClear={() => updateQuery("")}
          />
        ) : (
          <>
            <CalendarEventsTable items={visibleItems} />
            <DataPagination
              endRecord={Math.min(startIndex + pageSize, filteredItems.length)}
              page={currentPage}
              startRecord={startIndex + 1}
              totalPages={totalPages}
              totalRecords={filteredItems.length}
              onPageChange={updatePage}
            />
          </>
        )}
      </DataTableCard>
    </section>
  );
}
