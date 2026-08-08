import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { MarketCapFilterSelect } from "@/components/common/market-cap-filter-select";
import { Sp500FilterSelect } from "@/components/common/sp500-filter-select";
import { NoSearchResults } from "@/components/common/no-search-results";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import {
  type DataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { calendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";
import type { CreateNasdaqCalendarEarningsResult } from "@/data-access/schemas/calendar-earning";
import { CalendarEarningsCreateDialog } from "@/features/calendar-earnings/components/calendar-earnings-create-dialog";
import { CalendarEarningsCreateSummary } from "@/features/calendar-earnings/components/calendar-earnings-create-summary";
import { CalendarEarningsEmptyState } from "@/features/calendar-earnings/components/calendar-earnings-empty-state";
import { CalendarEarningsTable } from "@/features/calendar-earnings/components/calendar-earnings-table";
import {
  filterByMarketCap,
  getMarketCapFilterLabel,
  type MarketCapFilter,
} from "@/lib/market-cap";
import {
  filterBySp500,
  getSp500FilterLabel,
  type Sp500Filter,
} from "@/lib/sp500";

const pageSize = 50;
const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

export function CalendarEarningsPage() {
  const calendarEarningsQuery = useSuspenseQuery(calendarEarningsQueryOptions);
  const {
    setState: setTableState,
    state: tableState,
    updatePage,
    updateQuery,
  } = useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const [marketCapFilter, setMarketCapFilter] =
    useState<MarketCapFilter>("all");
  const [sp500Filter, setSp500Filter] = useState<Sp500Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createResult, setCreateResult] =
    useState<CreateNasdaqCalendarEarningsResult | null>(null);
  const filteredItems = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("en-US");
    const marketCapFilteredItems = filterByMarketCap(
      calendarEarningsQuery.data,
      marketCapFilter,
    );
    const sp500FilteredItems = filterBySp500(
      marketCapFilteredItems,
      sp500Filter,
    );

    if (!query) {
      return sp500FilteredItems;
    }

    return sp500FilteredItems.filter((item) =>
      [
        item.symbol,
        item.name,
        item.marketCap ?? "",
        item.reportDate,
        item.reportTime ?? "미정",
      ].some((value) => value.toLocaleLowerCase("en-US").includes(query)),
    );
  }, [calendarEarningsQuery.data, filterQuery, marketCapFilter, sp500Filter]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);
  const selectedMarketCapLabel = getMarketCapFilterLabel(marketCapFilter);
  const selectedSp500Label = getSp500FilterLabel(sp500Filter);
  const activeFilterDescription = [
    filterQuery,
    marketCapFilter === "all" ? "" : selectedMarketCapLabel,
    sp500Filter === "all" ? "" : selectedSp500Label,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <>
              <Button
                disabled={calendarEarningsQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => void calendarEarningsQuery.refetch()}
              >
                {calendarEarningsQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                NASDAQ 일정 추가
              </Button>
            </>
          }
          description="NASDAQ 종목의 실적 발표 일정을 한국 기준으로 조회합니다."
          eyebrow="Earnings calendar"
          recordCount={calendarEarningsQuery.data.length}
          title="실적"
        />
        {createResult ? (
          <CalendarEarningsCreateSummary
            result={createResult}
            onClose={() => setCreateResult(null)}
          />
        ) : null}
        <DataTableToolbar
          controls={
            <>
              <MarketCapFilterSelect
                value={marketCapFilter}
                onValueChange={(value) => {
                  setMarketCapFilter(value);
                  setTableState((previous) => ({
                    ...previous,
                    page: 1,
                  }));
                }}
              />
              <Sp500FilterSelect
                value={sp500Filter}
                onValueChange={(value) => {
                  setSp500Filter(value);
                  setTableState((previous) => ({
                    ...previous,
                    page: 1,
                  }));
                }}
              />
            </>
          }
          label="실적 일정 검색"
          placeholder="종목, 종목명, 시가총액, 발표일, 발표 시간 검색"
          query={tableState.q}
          onFilterChange={updateFilterQuery}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="발표일, 발표 시간, 종목 순서로 표시됩니다."
          recordCount={filteredItems.length}
          title="실적 일정"
        >
          {calendarEarningsQuery.data.length === 0 ? (
            <CalendarEarningsEmptyState onCreate={() => setCreateOpen(true)} />
          ) : filteredItems.length === 0 ? (
            <NoSearchResults
              query={activeFilterDescription}
              onClear={() => {
                updateQuery("");
                setMarketCapFilter("all");
                setSp500Filter("all");
              }}
            />
          ) : (
            <>
              <CalendarEarningsTable items={visibleItems} />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredItems.length,
                )}
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
      <CalendarEarningsCreateDialog
        open={createOpen}
        onCreated={(result) => {
          setCreateResult(result);
          setCreateOpen(false);
        }}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
