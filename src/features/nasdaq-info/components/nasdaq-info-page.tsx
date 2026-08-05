import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FileUpIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  type DataTableState,
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

const pageSize = 50;
const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

export function NasdaqInfoPage() {
  const nasdaqInfoQuery = useSuspenseQuery(nasdaqInfoQueryOptions);
  const {
    state: tableState,
    updatePage,
    updateQuery,
  } = useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<NasdaqInfoUploadResult | null>(null);
  const filteredItems = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("en-US");

    if (!query) {
      return nasdaqInfoQuery.data;
    }

    return nasdaqInfoQuery.data.filter((item) =>
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
  }, [filterQuery, nasdaqInfoQuery.data]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);

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
          label="나스닥 정보 검색"
          placeholder="심볼, 종목명, 시가총액, 국가, IPO 연도, 섹터, 산업 검색"
          query={tableState.q}
          onFilterChange={updateFilterQuery}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="NASDAQ 종목 정보를 심볼 오름차순으로 표시합니다."
          recordCount={filteredItems.length}
          title="NASDAQ 종목 정보"
        >
          {nasdaqInfoQuery.data.length === 0 ? (
            <NasdaqInfoEmptyState onUpload={() => setUploadOpen(true)} />
          ) : filteredItems.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <NasdaqInfoTable items={visibleItems} />
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
