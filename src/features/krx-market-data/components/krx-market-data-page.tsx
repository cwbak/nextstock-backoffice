import { useMemo, useState } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, DatabaseIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataPagination } from "@/components/common/data-table-controls";
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
import { krxMarketDataQueryOptions } from "@/data-access/queries/krx-market-data/queries";
import { krxStocksQueryOptions } from "@/data-access/queries/krx-stocks/queries";
import type {
  KrxMarketDataCreatePayload,
  KrxMarketDataCreateResult,
  KrxMarketDataListParams,
} from "@/data-access/schemas/krx-market-data";
import { KrxMarketDataEmptyState } from "@/features/krx-market-data/components/krx-market-data-empty-state";
import { KrxMarketDataFilterForm } from "@/features/krx-market-data/components/krx-market-data-filter-form";
import { KrxMarketDataSaveDialog } from "@/features/krx-market-data/components/krx-market-data-save-dialog";
import { KrxMarketDataSaveSummary } from "@/features/krx-market-data/components/krx-market-data-save-summary";
import { KrxMarketDataTable } from "@/features/krx-market-data/components/krx-market-data-table";

const pageSize = 50;
const inactiveParams: KrxMarketDataListParams = {
  stockCode: "000000",
  from: "",
  to: "",
};

interface SaveSummary {
  payload: KrxMarketDataCreatePayload;
  result: KrxMarketDataCreateResult;
}

function getRangeLabel({ from, to }: KrxMarketDataListParams) {
  if (from && to) {
    return `${from}–${to}`;
  }
  if (from) {
    return `${from} 이후`;
  }
  if (to) {
    return `${to} 이전`;
  }
  return "전체 기간";
}

export function KrxMarketDataPage() {
  const krxStocksQuery = useSuspenseQuery(krxStocksQueryOptions);
  const [params, setParams] = useState<KrxMarketDataListParams | null>(null);
  const [page, setPage] = useState(1);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveSummary, setSaveSummary] = useState<SaveSummary | null>(null);
  const marketDataQuery = useQuery({
    ...krxMarketDataQueryOptions(params ?? inactiveParams),
    enabled: params !== null,
  });
  const selectedStock = useMemo(
    () =>
      params
        ? (krxStocksQuery.data.find(
            (stock) => stock.code === params.stockCode,
          ) ?? null)
        : null,
    [krxStocksQuery.data, params],
  );
  const totalRecords = marketDataQuery.data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = marketDataQuery.data?.slice(
    startIndex,
    startIndex + pageSize,
  );
  const stockLabel = selectedStock
    ? `${selectedStock.code} · ${selectedStock.name}`
    : (params?.stockCode ?? "KRX 종목");
  const tableDescription = params
    ? `${stockLabel} · ${getRangeLabel(params)} · 날짜 오름차순`
    : "종목을 선택해 ClickHouse에 저장된 일봉을 조회합니다.";

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <>
              <Button
                disabled={params === null || marketDataQuery.isFetching}
                type="button"
                variant="outline"
                onClick={() => void marketDataQuery.refetch()}
              >
                {marketDataQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button
                disabled={krxStocksQuery.data.length === 0}
                type="button"
                onClick={() => setSaveOpen(true)}
              >
                <DatabaseIcon aria-hidden="true" data-icon="inline-start" />
                일봉 저장
              </Button>
            </>
          }
          description="KRX 종목의 보정주가 일봉을 조회하고 한국투자증권에서 가져와 저장합니다."
          eyebrow="KRX daily market data"
          recordCount={totalRecords}
          title="KRX 일봉"
        />
        {saveSummary ? (
          <KrxMarketDataSaveSummary
            from={saveSummary.payload.from}
            result={saveSummary.result}
            stockLabel={
              krxStocksQuery.data.find(
                (stock) => stock.code === saveSummary.payload.stockCode,
              )?.name ?? saveSummary.payload.stockCode
            }
            to={saveSummary.payload.to}
            onClose={() => setSaveSummary(null)}
          />
        ) : null}
        <KrxMarketDataFilterForm
          stocks={krxStocksQuery.data}
          onSearch={(nextParams) => {
            setParams(nextParams);
            setPage(1);
          }}
        />
        <DataTableCard
          description={tableDescription}
          recordCount={totalRecords}
          title="KRX 일봉 원장"
        >
          {params === null ? (
            <KrxMarketDataEmptyState mode="not-searched" />
          ) : marketDataQuery.isPending ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              일봉을 불러오는 중입니다.
            </div>
          ) : marketDataQuery.isError ? (
            <Empty className="min-h-72 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertTriangleIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>KRX 일봉을 불러오지 못했습니다</EmptyTitle>
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
          ) : !visibleItems?.length ? (
            <KrxMarketDataEmptyState mode="no-results" />
          ) : (
            <>
              <KrxMarketDataTable items={visibleItems} stockName={stockLabel} />
              <DataPagination
                endRecord={Math.min(startIndex + pageSize, totalRecords)}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setPage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <KrxMarketDataSaveDialog
        initialParams={params}
        open={saveOpen}
        stocks={krxStocksQuery.data}
        onCreated={(result, payload) => {
          setSaveSummary({ payload, result });
          setParams({
            stockCode: payload.stockCode,
            from: payload.from,
            to: payload.to,
          });
          setPage(1);
          setSaveOpen(false);
        }}
        onOpenChange={setSaveOpen}
      />
    </>
  );
}
