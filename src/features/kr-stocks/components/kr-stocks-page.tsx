import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  type SortableDataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import type { Corporation } from "@/data-access/schemas/corporation";
import type {
  KrStock,
  KrStockSyncResult,
} from "@/data-access/schemas/kr-stock";
import { CorporationDetailSheet } from "@/features/corporations";
import { KrStockUpsertDialog } from "@/features/kr-stocks/components/kr-stock-create-dialog";
import { KrStockDeleteDialog } from "@/features/kr-stocks/components/kr-stock-delete-dialog";
import { KrStockEditDialog } from "@/features/kr-stocks/components/kr-stock-edit-dialog";
import { KrStockSyncDialog } from "@/features/kr-stocks/components/kr-stock-sync-dialog";
import { KrStockSyncSummary } from "@/features/kr-stocks/components/kr-stock-sync-summary";
import { KrStocksPageActions } from "@/features/kr-stocks/components/kr-stocks-page-actions";
import { KrStocksEmptyState } from "@/features/kr-stocks/components/kr-stocks-empty-state";
import {
  type KrStockSortField,
  KrStocksTable,
} from "@/features/kr-stocks/components/kr-stocks-table";

const pageSize = 50;
const krStockNameCollator = new Intl.Collator(["ko-KR", "en"], {
  numeric: true,
  sensitivity: "base",
});
const initialTableState: SortableDataTableState<KrStockSortField> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function KrStocksPage() {
  const krStocksQuery = useSuspenseQuery(krStocksQueryOptions);
  const corporationsQuery = useSuspenseQuery(corporationsQueryOptions);
  const {
    setState: setTableState,
    state: tableState,
    updatePage,
    updateQuery,
  } = useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const { sortBy, sortDirection } = tableState;
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<KrStockSyncResult | null>(null);
  const [editingKrStock, setEditingKrStock] = useState<KrStock | null>(null);
  const [deletingKrStock, setDeletingKrStock] = useState<KrStock | null>(null);
  const [viewingCorporation, setViewingCorporation] =
    useState<Corporation | null>(null);
  const corporationsByCode = useMemo(
    () =>
      new Map(
        corporationsQuery.data.map((corporation) => [
          corporation.code,
          corporation,
        ]),
      ),
    [corporationsQuery.data],
  );
  const isFetching = krStocksQuery.isFetching || corporationsQuery.isFetching;
  const filteredKrStocks = useMemo(() => {
    const query = filterQuery.toLocaleLowerCase("ko-KR");

    if (!query) {
      return krStocksQuery.data;
    }

    return krStocksQuery.data.filter((krStock) => {
      const corporation = corporationsByCode.get(krStock.corporationCode);

      return [
        krStock.code,
        krStock.name,
        krStock.marketType,
        krStock.stockType,
        krStock.corporationCode,
        krStock.listDd,
        krStock.parval?.toString() ?? "",
        krStock.listShrs?.toString() ?? "",
        corporation?.name ?? "",
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query));
    });
  }, [corporationsByCode, filterQuery, krStocksQuery.data]);
  const sortedKrStocks = useMemo(() => {
    if (sortBy === null) {
      return filteredKrStocks;
    }

    return [...filteredKrStocks].sort((first, second) => {
      let comparison: number;

      if (sortBy === "name") {
        comparison = krStockNameCollator.compare(first.name, second.name);
      } else {
        comparison = first.listDd.localeCompare(second.listDd);
      }

      if (comparison === 0) {
        comparison = first.code.localeCompare(second.code);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredKrStocks, sortBy, sortDirection]);
  const totalPages = Math.max(1, Math.ceil(sortedKrStocks.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleKrStocks = sortedKrStocks.slice(
    startIndex,
    startIndex + pageSize,
  );

  const refresh = async () => {
    await Promise.all([krStocksQuery.refetch(), corporationsQuery.refetch()]);
  };

  const updateSort = (sortBy: KrStockSortField) => {
    const sortDirection =
      tableState.sortBy === sortBy && tableState.sortDirection === "asc"
        ? "desc"
        : "asc";

    setTableState((previous) => ({
      ...previous,
      page: 1,
      sortBy,
      sortDirection,
    }));
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <KrStocksPageActions
              isFetching={isFetching}
              onRefresh={() => void refresh()}
              onSync={() => setSyncOpen(true)}
              onUpsert={() => setUpsertOpen(true)}
            />
          }
          description="DART·한국투자증권으로 종목을 생성·갱신하고 KRX 상장 정보를 동기화·관리합니다."
          eyebrow="KR stocks"
          recordCount={krStocksQuery.data.length}
          title="KR 종목"
        />
        {syncResult ? (
          <KrStockSyncSummary
            result={syncResult}
            onClose={() => setSyncResult(null)}
          />
        ) : null}
        <DataTableToolbar
          label="KR 종목 검색"
          onFilterChange={updateFilterQuery}
          placeholder="종목 코드, 종목명, 시장, 주식 종류, 상장 정보, 연결 법인 검색"
          query={tableState.q}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="헤더를 눌러 종목명과 상장일 기준으로 정렬할 수 있습니다."
          recordCount={filteredKrStocks.length}
          title="KR 종목 원장"
        >
          {krStocksQuery.data.length === 0 ? (
            <KrStocksEmptyState onUpsert={() => setUpsertOpen(true)} />
          ) : filteredKrStocks.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <KrStocksTable
                corporationsByCode={corporationsByCode}
                krStocks={visibleKrStocks}
                onDelete={setDeletingKrStock}
                onEdit={setEditingKrStock}
                onSort={updateSort}
                onView={setViewingCorporation}
                sortBy={tableState.sortBy}
                sortDirection={tableState.sortDirection}
              />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredKrStocks.length,
                )}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={filteredKrStocks.length}
                onPageChange={updatePage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <KrStockUpsertDialog
        corporations={corporationsQuery.data}
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
      />
      <KrStockSyncDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        onSynced={(result) => {
          setSyncResult(result);
          setSyncOpen(false);
        }}
      />
      <KrStockEditDialog
        corporations={corporationsQuery.data}
        krStock={editingKrStock ?? undefined}
        open={editingKrStock !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingKrStock(null);
          }
        }}
      />
      <KrStockDeleteDialog
        krStock={deletingKrStock}
        onClose={() => setDeletingKrStock(null)}
      />
      {viewingCorporation ? (
        <CorporationDetailSheet
          corporation={viewingCorporation}
          open
          onOpenChange={(open) => {
            if (!open) {
              setViewingCorporation(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
