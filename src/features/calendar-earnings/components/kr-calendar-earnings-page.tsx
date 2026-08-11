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
import { krCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";
import { CalendarEarningsTable } from "@/features/calendar-earnings/components/calendar-earnings-table";
import { KrCalendarEarningsEmptyState } from "@/features/calendar-earnings/components/kr-calendar-earnings-empty-state";

const pageSize = 50;
const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

export function KrCalendarEarningsPage() {
  const earningsQuery = useSuspenseQuery(krCalendarEarningsQueryOptions);
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
      return earningsQuery.data;
    }

    return earningsQuery.data.filter((item) =>
      [
        item.code,
        item.name,
        item.marketType,
        item.reportDate,
        item.reportTime ?? "미정",
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query)),
    );
  }, [earningsQuery.data, filterQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <section className="flex flex-col gap-6">
      <DataPageHeader
        actions={
          <Button
            disabled={earningsQuery.isFetching}
            type="button"
            variant="outline"
            onClick={() => void earningsQuery.refetch()}
          >
            {earningsQuery.isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
            )}
            새로고침
          </Button>
        }
        description="KOSPI·KOSDAQ 종목의 실적 발표 일정을 조회합니다."
        eyebrow="KR earnings calendar"
        recordCount={earningsQuery.data.length}
        title="실적(KR)"
      />
      <DataTableToolbar
        label="KR 실적 일정 검색"
        placeholder="종목 코드, 종목명, 시장, 발표일, 발표 시간 검색"
        query={tableState.q}
        onFilterChange={updateFilterQuery}
        onQueryChange={updateQuery}
      />
      <DataTableCard
        description="발표일, 발표 시간, 시장, 종목 코드 순서로 표시됩니다."
        recordCount={filteredItems.length}
        title="KR 실적 일정"
      >
        {earningsQuery.data.length === 0 ? (
          <KrCalendarEarningsEmptyState />
        ) : filteredItems.length === 0 ? (
          <NoSearchResults
            query={filterQuery}
            onClear={() => updateQuery("")}
          />
        ) : (
          <>
            <CalendarEarningsTable
              classificationLabel="시장"
              items={visibleItems.map((item) => ({
                classification: item.marketType,
                identifier: item.code,
                marketCap: item.marketCap,
                name: item.name,
                reportDate: item.reportDate,
                reportTime: item.reportTime,
              }))}
            />
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
