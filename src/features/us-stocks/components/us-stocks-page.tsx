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
import { usStocksQueryOptions } from "@/data-access/queries/us-stocks/queries";
import type { UsStockUploadResult } from "@/data-access/schemas/us-stock";
import { UsStockEmptyState } from "@/features/us-stocks/components/us-stock-empty-state";
import { UsStocksTable } from "@/features/us-stocks/components/us-stocks-table";
import { UsStockUploadDialog } from "@/features/us-stocks/components/us-stock-upload-dialog";
import { UsStockUploadSummary } from "@/features/us-stocks/components/us-stock-upload-summary";
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
import { sortUsStocksByMarketCap } from "@/features/us-stocks/us-stock-sort";

const pageSize = 50;
const initialTableState: SortableDataTableState<"marketCap"> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function UsStocksPage() {
  const usStocksQuery = useSuspenseQuery(usStocksQueryOptions);
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
  const [uploadResult, setUploadResult] = useState<UsStockUploadResult | null>(
    null,
  );
  const filteredItems = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("en-US");
    const marketCapFilteredItems = filterByMarketCap(
      usStocksQuery.data,
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
  }, [filterQuery, marketCapFilter, usStocksQuery.data, sp500Filter]);
  const sortedItems = useMemo(
    () =>
      tableState.sortBy === null
        ? filteredItems
        : sortUsStocksByMarketCap(filteredItems, tableState.sortDirection),
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
                disabled={usStocksQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => void usStocksQuery.refetch()}
              >
                {usStocksQuery.isFetching ? (
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
          description="Us Stock Screener CSV를 반영하고 미국 상장 종목 기준 정보를 조회합니다."
          eyebrow="US stocks"
          recordCount={usStocksQuery.data.length}
          title="US 종목 정보"
        />
        {uploadResult ? (
          <UsStockUploadSummary
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
          label="US 종목 정보 검색"
          placeholder="심볼, 종목명, 시가총액, 국가, IPO 연도, 섹터, 산업 검색"
          query={tableState.q}
          onFilterChange={updateFilterQuery}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="기본은 심볼 순이며 시가총액 헤더를 눌러 오름차순·내림차순으로 정렬할 수 있습니다."
          recordCount={filteredItems.length}
          title="US 종목 정보"
        >
          {usStocksQuery.data.length === 0 ? (
            <UsStockEmptyState onUpload={() => setUploadOpen(true)} />
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
              <UsStocksTable
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
      <UsStockUploadDialog
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
