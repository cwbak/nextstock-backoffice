import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon, RefreshCwIcon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { krxStocksQueryOptions } from "@/data-access/queries/krx-stocks/queries";
import type { Corporation } from "@/data-access/schemas/corporation";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import { CorporationDetailSheet } from "@/features/corporations";
import { KrxStockCreateDialog } from "@/features/krx-stocks/components/krx-stock-create-dialog";
import { KrxStockDeleteDialog } from "@/features/krx-stocks/components/krx-stock-delete-dialog";
import { KrxStockEditDialog } from "@/features/krx-stocks/components/krx-stock-edit-dialog";
import { KrxStocksEmptyState } from "@/features/krx-stocks/components/krx-stocks-empty-state";
import {
  type KrxStockSortField,
  KrxStocksTable,
} from "@/features/krx-stocks/components/krx-stocks-table";

const pageSize = 50;
const krxStockNameCollator = new Intl.Collator(["ko-KR", "en"], {
  numeric: true,
  sensitivity: "base",
});
const initialTableState: SortableDataTableState<KrxStockSortField> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function KrxStocksPage() {
  const krxStocksQuery = useSuspenseQuery(krxStocksQueryOptions);
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editingKrxStock, setEditingKrxStock] = useState<KrxStock | null>(null);
  const [deletingKrxStock, setDeletingKrxStock] = useState<KrxStock | null>(
    null,
  );
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
  const isFetching = krxStocksQuery.isFetching || corporationsQuery.isFetching;
  const filteredKrxStocks = useMemo(() => {
    const query = filterQuery.toLocaleLowerCase("ko-KR");

    if (!query) {
      return krxStocksQuery.data;
    }

    return krxStocksQuery.data.filter((krxStock) => {
      const corporation = corporationsByCode.get(krxStock.corporationCode);

      return [
        krxStock.code,
        krxStock.name,
        krxStock.marketType,
        krxStock.stockType,
        krxStock.corporationCode,
        krxStock.listDd,
        krxStock.parval?.toString() ?? "",
        krxStock.listShrs?.toString() ?? "",
        corporation?.name ?? "",
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query));
    });
  }, [corporationsByCode, filterQuery, krxStocksQuery.data]);
  const sortedKrxStocks = useMemo(() => {
    if (sortBy === null) {
      return filteredKrxStocks;
    }

    return [...filteredKrxStocks].sort((first, second) => {
      let comparison: number;

      if (sortBy === "name") {
        comparison = krxStockNameCollator.compare(first.name, second.name);
      } else {
        comparison = first.listDd.localeCompare(second.listDd);
      }

      if (comparison === 0) {
        comparison = first.code.localeCompare(second.code);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredKrxStocks, sortBy, sortDirection]);
  const totalPages = Math.max(1, Math.ceil(sortedKrxStocks.length / pageSize));
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleKrxStocks = sortedKrxStocks.slice(
    startIndex,
    startIndex + pageSize,
  );

  const refresh = async () => {
    await Promise.all([krxStocksQuery.refetch(), corporationsQuery.refetch()]);
  };

  const updateSort = (sortBy: KrxStockSortField) => {
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
            <>
              <Button
                disabled={isFetching}
                type="button"
                variant="outline"
                onClick={() => void refresh()}
              >
                {isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                종목 등록
              </Button>
            </>
          }
          description="DART·KRX에서 법인과 종목을 함께 등록하고 상장 정보를 관리합니다."
          eyebrow="KRX stocks"
          recordCount={krxStocksQuery.data.length}
          title="KRX 종목"
        />
        <DataTableToolbar
          label="KRX 종목 검색"
          onFilterChange={updateFilterQuery}
          placeholder="종목 코드, 종목명, 시장, 주식 종류, 상장 정보, 연결 법인 검색"
          query={tableState.q}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="헤더를 눌러 종목명과 상장일 기준으로 정렬할 수 있습니다."
          recordCount={filteredKrxStocks.length}
          title="KRX 종목 원장"
        >
          {krxStocksQuery.data.length === 0 ? (
            <KrxStocksEmptyState onCreate={() => setCreateOpen(true)} />
          ) : filteredKrxStocks.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <KrxStocksTable
                corporationsByCode={corporationsByCode}
                krxStocks={visibleKrxStocks}
                onDelete={setDeletingKrxStock}
                onEdit={setEditingKrxStock}
                onSort={updateSort}
                onView={setViewingCorporation}
                sortBy={tableState.sortBy}
                sortDirection={tableState.sortDirection}
              />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredKrxStocks.length,
                )}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={filteredKrxStocks.length}
                onPageChange={updatePage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <KrxStockCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <KrxStockEditDialog
        corporations={corporationsQuery.data}
        krxStock={editingKrxStock ?? undefined}
        open={editingKrxStock !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingKrxStock(null);
          }
        }}
      />
      <KrxStockDeleteDialog
        krxStock={deletingKrxStock}
        onClose={() => setDeletingKrxStock(null)}
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
