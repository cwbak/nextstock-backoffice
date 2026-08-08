import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FileUpIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { MarketCapFilterSelect } from "@/components/common/market-cap-filter-select";
import { Sp500FilterSelect } from "@/components/common/sp500-filter-select";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  type SortableDataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { nasdaqInfoQueryOptions } from "@/data-access/queries/nasdaq-info/queries";
import type { NasdaqInfoUploadResult } from "@/data-access/schemas/nasdaq-info";
import { NasdaqInfoEmptyState } from "@/features/nasdaq-info/components/nasdaq-info-empty-state";
import { NasdaqInfoTable } from "@/features/nasdaq-info/components/nasdaq-info-table";
import { NasdaqInfoUploadDialog } from "@/features/nasdaq-info/components/nasdaq-info-upload-dialog";
import { NasdaqInfoUploadSummary } from "@/features/nasdaq-info/components/nasdaq-info-upload-summary";
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
import { sortNasdaqInfoByMarketCap } from "@/features/nasdaq-info/nasdaq-info-sort";

const pageSize = 50;
const initialTableState: SortableDataTableState<"marketCap"> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function NasdaqInfoPage() {
  const nasdaqInfoQuery = useSuspenseQuery(nasdaqInfoQueryOptions);
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<NasdaqInfoUploadResult | null>(null);
  const filteredItems = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("en-US");
    const marketCapFilteredItems = filterByMarketCap(
      nasdaqInfoQuery.data,
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
        item.country ?? "",
        item.ipoYear?.toString() ?? "",
        item.sector ?? "",
        item.industry ?? "",
      ].some((value) => value.toLocaleLowerCase("en-US").includes(query)),
    );
  }, [filterQuery, marketCapFilter, nasdaqInfoQuery.data, sp500Filter]);
  const sortedItems = useMemo(
    () =>
      tableState.sortBy === null
        ? filteredItems
        : sortNasdaqInfoByMarketCap(filteredItems, tableState.sortDirection),
    [filteredItems, tableState.sortBy, tableState.sortDirection],
  );
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = sortedItems.slice(startIndex, startIndex + pageSize);
  const selectedMarketCapLabel = getMarketCapFilterLabel(marketCapFilter);
  const selectedSp500Label = getSp500FilterLabel(sp500Filter);
  const activeFilterDescription = [
    filterQuery,
    marketCapFilter === "all" ? "" : selectedMarketCapLabel,
    sp500Filter === "all" ? "" : selectedSp500Label,
  ]
    .filter(Boolean)
    .join(" · ");

  const updateSort = () => {
    const sortDirection =
      tableState.sortBy === "marketCap" && tableState.sortDirection === "asc"
        ? "desc"
        : "asc";

    setTableState((previous) => ({
      ...previous,
      page: 1,
      sortBy: "marketCap",
      sortDirection,
    }));
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <>
              <Button
                disabled={nasdaqInfoQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => void nasdaqInfoQuery.refetch()}
              >
                {nasdaqInfoQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button type="button" onClick={() => setUploadOpen(true)}>
                <FileUpIcon aria-hidden="true" data-icon="inline-start" />
                CSV 업로드
              </Button>
            </>
          }
          description="Nasdaq Stock Screener CSV를 반영하고 미국 상장 종목 기준 정보를 조회합니다."
          eyebrow="NASDAQ info"
          recordCount={nasdaqInfoQuery.data.length}
          title="나스닥 정보"
        />
        {uploadResult ? (
          <NasdaqInfoUploadSummary
            result={uploadResult}
            onClose={() => setUploadResult(null)}
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
          label="나스닥 정보 검색"
          placeholder="심볼, 종목명, 시가총액, 국가, IPO 연도, 섹터, 산업 검색"
          query={tableState.q}
          onFilterChange={updateFilterQuery}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="기본은 심볼 순이며 시가총액 헤더를 눌러 오름차순·내림차순으로 정렬할 수 있습니다."
          recordCount={filteredItems.length}
          title="NASDAQ 종목 정보"
        >
          {nasdaqInfoQuery.data.length === 0 ? (
            <NasdaqInfoEmptyState onUpload={() => setUploadOpen(true)} />
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
              <NasdaqInfoTable
                items={visibleItems}
                sortBy={tableState.sortBy}
                sortDirection={tableState.sortDirection}
                onSort={updateSort}
              />
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
      <NasdaqInfoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(result) => {
          setUploadResult(result);
          setUploadOpen(false);
        }}
      />
    </>
  );
}
