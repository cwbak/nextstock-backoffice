import { useMemo, useState } from "react";

import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";

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
  KrMarketDataCreateResult,
  KrMarketDataFilterValues,
  KrMarketDataKisDailyResult,
  KrMarketDataListParams,
} from "@/data-access/schemas/kr-market-data";
import { KrMarketDataCreateAllDialog } from "@/features/kr-market-data/components/kr-market-data-create-all-dialog";
import { KrMarketDataEmptyState } from "@/features/kr-market-data/components/kr-market-data-empty-state";
import { KrMarketDataFilterForm } from "@/features/kr-market-data/components/kr-market-data-filter-form";
import { KrMarketDataInfiniteLoader } from "@/features/kr-market-data/components/kr-market-data-infinite-loader";
import { KrMarketDataKisDailyDialog } from "@/features/kr-market-data/components/kr-market-data-kis-daily-dialog";
import { KrMarketDataPageActions } from "@/features/kr-market-data/components/kr-market-data-page-actions";
import { KrMarketDataSaveDialog } from "@/features/kr-market-data/components/kr-market-data-save-dialog";
import { KrMarketDataSaveSummary } from "@/features/kr-market-data/components/kr-market-data-save-summary";
import { KrMarketDataTable } from "@/features/kr-market-data/components/kr-market-data-table";
import { getCurrentLocalDate } from "@/features/kr-market-data/kr-market-data-date";
import { getKrMarketDataPeriodLabel } from "@/features/kr-market-data/kr-market-data-period";

const inactiveParams: KrMarketDataListParams = {
  adjusted: true,
  stockCode: "000000",
  period: "daily",
  end: "1970-01-01",
  limit: krMarketDataPageLimit,
};

interface SaveSummary {
  from: string;
  result: KrMarketDataCreateResult | KrMarketDataKisDailyResult;
  stockLabel: string;
  to: string;
}

export function KrMarketDataPage() {
  const krStocksQuery = useSuspenseQuery(krStocksQueryOptions);
  const [filters, setFilters] = useState<KrMarketDataFilterValues | null>(null);
  const [queryEnd, setQueryEnd] = useState(getCurrentLocalDate);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveAllOpen, setSaveAllOpen] = useState(false);
  const [saveKisDailyOpen, setSaveKisDailyOpen] = useState(false);
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
    ? `${stockLabel} · ${getKrMarketDataPeriodLabel(filters.period)} · ${filters.adjusted ? "수정주가" : "원본주가"} · ${queryEnd} 기준 · 최신 날짜순`
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
            <KrMarketDataPageActions
              canRefresh={filters !== null}
              canSaveStock={krStocksQuery.data.length > 0}
              isRefreshing={marketDataQuery.isFetching}
              onRefresh={refresh}
              onSaveAll={() => setSaveAllOpen(true)}
              onSaveKisDaily={() => setSaveKisDailyOpen(true)}
              onSaveStock={() => setSaveOpen(true)}
            />
          }
          description="저장된 일봉을 일봉·주봉·월봉으로 조회하고 한국투자증권 종목별 일봉 또는 KRX 일자별 전 종목 일봉을 저장합니다."
          eyebrow="KR candle market data"
          recordCount={totalRecords}
          title="KR 캔들"
        />
        {saveSummary ? (
          <KrMarketDataSaveSummary
            from={saveSummary.from}
            result={saveSummary.result}
            stockLabel={saveSummary.stockLabel}
            to={saveSummary.to}
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
              filters.adjusted === nextFilters.adjusted &&
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
              <KrMarketDataTable
                items={visibleItems}
                showPriceChange={!filters.adjusted}
                stockName={stockLabel}
              />
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
          setSaveSummary({
            from: payload.from,
            result,
            stockLabel:
              krStocksQuery.data.find(
                (stock) => stock.code === payload.stockCode,
              )?.name ?? payload.stockCode,
            to: payload.to,
          });
          setFilters({
            adjusted: payload.adjusted,
            stockCode: payload.stockCode,
            period: "daily",
          });
          setQueryEnd(getCurrentLocalDate());
          setSaveOpen(false);
        }}
        onOpenChange={setSaveOpen}
      />
      <KrMarketDataCreateAllDialog
        open={saveAllOpen}
        onCreated={(result, payload) => {
          setSaveSummary({
            from: payload.from,
            result,
            stockLabel: "KRX 전 종목",
            to: payload.to,
          });
          setSaveAllOpen(false);
        }}
        onOpenChange={setSaveAllOpen}
      />
      <KrMarketDataKisDailyDialog
        open={saveKisDailyOpen}
        onCreated={(result) => {
          setSaveSummary({
            from: result.from,
            result,
            stockLabel: "KIS 전 종목",
            to: result.to,
          });
          setSaveKisDailyOpen(false);
        }}
        onOpenChange={setSaveKisDailyOpen}
      />
    </>
  );
}
