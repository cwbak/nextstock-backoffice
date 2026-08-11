import { useMemo, useState } from "react";

import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, DatabaseIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataTableCard } from "@/components/common/data-table-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import {
  krMarketDataInfiniteQueryOptions,
  krMarketDataPageLimit,
} from "@/data-access/queries/kr-market-data/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import type {
  KrMarketDataCreatePayload,
  KrMarketDataCreateResult,
  KrMarketDataFilterValues,
  KrMarketDataListParams,
} from "@/data-access/schemas/kr-market-data";
import { KrMarketDataEmptyState } from "@/features/kr-market-data/components/kr-market-data-empty-state";
import { KrMarketDataFilterForm } from "@/features/kr-market-data/components/kr-market-data-filter-form";
import { KrMarketDataInfiniteLoader } from "@/features/kr-market-data/components/kr-market-data-infinite-loader";
import { KrMarketDataSaveDialog } from "@/features/kr-market-data/components/kr-market-data-save-dialog";
import { KrMarketDataSaveSummary } from "@/features/kr-market-data/components/kr-market-data-save-summary";
import { KrMarketDataTable } from "@/features/kr-market-data/components/kr-market-data-table";
import { getCurrentLocalDate } from "@/features/kr-market-data/kr-market-data-date";
import { getKrMarketDataPeriodLabel } from "@/features/kr-market-data/kr-market-data-period";

const inactiveParams: KrMarketDataListParams = {
  stockCode: "000000",
  period: "daily",
  end: "1970-01-01",
  limit: krMarketDataPageLimit,
};

interface SaveSummary {
  payload: KrMarketDataCreatePayload;
  result: KrMarketDataCreateResult;
}

export function KrMarketDataPage() {
  const krStocksQuery = useSuspenseQuery(krStocksQueryOptions);
  const [filters, setFilters] = useState<KrMarketDataFilterValues | null>(null);
  const [queryEnd, setQueryEnd] = useState(getCurrentLocalDate);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveSummary, setSaveSummary] = useState<SaveSummary | null>(null);
  const marketDataQuery = useInfiniteQuery({
    ...krMarketDataInfiniteQueryOptions(
      filters
        ? {
            ...filters,
            end: queryEnd,
            limit: krMarketDataPageLimit,
          }
        : inactiveParams,
    ),
    enabled: filters !== null,
  });
  const selectedStock = useMemo(
    () =>
      filters
        ? (krStocksQuery.data.find(
            (stock) => stock.code === filters.stockCode,
          ) ?? null)
        : null,
    [filters, krStocksQuery.data],
  );
  const marketDataPages = marketDataQuery.data?.pages;
  const visibleItems = useMemo(() => {
    const itemsByDate = new Map<
      string,
      NonNullable<typeof marketDataPages>[number][number]
    >();

    for (const page of marketDataPages ?? []) {
      for (const item of page) {
        itemsByDate.set(item.date, item);
      }
    }

    return Array.from(itemsByDate.values()).sort((first, second) =>
      second.date.localeCompare(first.date),
    );
  }, [marketDataPages]);
  const totalRecords = visibleItems.length;
  const stockLabel = selectedStock
    ? `${selectedStock.code} · ${selectedStock.name}`
    : (filters?.stockCode ?? "KR 종목");
  const tableDescription = filters
    ? `${stockLabel} · ${getKrMarketDataPeriodLabel(filters.period)} · ${queryEnd} 기준 · 최신 날짜순`
    : "종목과 주기를 선택해 ClickHouse에 저장된 캔들을 조회합니다.";

  const refresh = () => {
    const currentDate = getCurrentLocalDate();

    if (currentDate === queryEnd) {
      void marketDataQuery.refetch();
    } else {
      setQueryEnd(currentDate);
    }
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <>
              <Button
                disabled={filters === null || marketDataQuery.isFetching}
                type="button"
                variant="outline"
                onClick={refresh}
              >
                {marketDataQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button
                disabled={krStocksQuery.data.length === 0}
                type="button"
                onClick={() => setSaveOpen(true)}
              >
                <DatabaseIcon aria-hidden="true" data-icon="inline-start" />
                일봉 저장
              </Button>
            </>
          }
          description="저장된 일봉을 일봉·주봉·월봉으로 조회하고 한국투자증권에서 새 일봉을 가져와 저장합니다."
          eyebrow="KR candle market data"
          recordCount={totalRecords}
          title="KR 캔들"
        />
        {saveSummary ? (
          <KrMarketDataSaveSummary
            from={saveSummary.payload.from}
            result={saveSummary.result}
            stockLabel={
              krStocksQuery.data.find(
                (stock) => stock.code === saveSummary.payload.stockCode,
              )?.name ?? saveSummary.payload.stockCode
            }
            to={saveSummary.payload.to}
            onClose={() => setSaveSummary(null)}
          />
        ) : null}
        <KrMarketDataFilterForm
          appliedFilters={filters}
          stocks={krStocksQuery.data}
          onSearch={(nextFilters) => {
            const currentDate = getCurrentLocalDate();
            const sameQuery =
              filters?.stockCode === nextFilters.stockCode &&
              filters.period === nextFilters.period &&
              queryEnd === currentDate;

            setFilters(nextFilters);
            setQueryEnd(currentDate);

            if (sameQuery) {
              void marketDataQuery.refetch();
            }
          }}
        />
        <DataTableCard
          description={tableDescription}
          recordCount={totalRecords}
          title="KR 캔들 원장"
        >
          {filters === null ? (
            <KrMarketDataEmptyState mode="not-searched" />
          ) : marketDataQuery.isPending ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              캔들을 불러오는 중입니다.
            </div>
          ) : marketDataQuery.isError && visibleItems.length === 0 ? (
            <Empty className="min-h-72 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertTriangleIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>KR 캔들을 불러오지 못했습니다</EmptyTitle>
                <EmptyDescription>
                  {getErrorMessage(marketDataQuery.error)}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void marketDataQuery.refetch()}
                >
                  다시 시도
                </Button>
              </EmptyContent>
            </Empty>
          ) : visibleItems.length === 0 ? (
            <KrMarketDataEmptyState mode="no-results" />
          ) : (
            <>
              <KrMarketDataTable items={visibleItems} stockName={stockLabel} />
              <KrMarketDataInfiniteLoader
                error={
                  marketDataQuery.isFetchNextPageError
                    ? marketDataQuery.error
                    : null
                }
                hasNextPage={marketDataQuery.hasNextPage}
                isFetchingNextPage={marketDataQuery.isFetchingNextPage}
                onLoadMore={() => void marketDataQuery.fetchNextPage()}
                onRetry={() => void marketDataQuery.fetchNextPage()}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <KrMarketDataSaveDialog
        initialStockCode={filters?.stockCode}
        open={saveOpen}
        stocks={krStocksQuery.data}
        onCreated={(result, payload) => {
          setSaveSummary({ payload, result });
          setFilters({
            stockCode: payload.stockCode,
            period: "daily",
          });
          setQueryEnd(getCurrentLocalDate());
          setSaveOpen(false);
        }}
        onOpenChange={setSaveOpen}
      />
    </>
  );
}
