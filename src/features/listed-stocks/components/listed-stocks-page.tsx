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
import { listedStocksQueryOptions } from "@/data-access/queries/listed-stocks/queries";
import type { Corporation } from "@/data-access/schemas/corporation";
import type { ListedStock } from "@/data-access/schemas/listed-stock";
import { CorporationDetailSheet } from "@/features/corporations";
import { ListedStockCreateDialog } from "@/features/listed-stocks/components/listed-stock-create-dialog";
import { ListedStockDeleteDialog } from "@/features/listed-stocks/components/listed-stock-delete-dialog";
import { ListedStockEditDialog } from "@/features/listed-stocks/components/listed-stock-edit-dialog";
import { ListedStocksEmptyState } from "@/features/listed-stocks/components/listed-stocks-empty-state";
import {
  type ListedStockSortField,
  ListedStocksTable,
} from "@/features/listed-stocks/components/listed-stocks-table";

const pageSize = 50;
const listedStockNameCollator = new Intl.Collator(["ko-KR", "en"], {
  numeric: true,
  sensitivity: "base",
});
const initialTableState: SortableDataTableState<ListedStockSortField> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function ListedStocksPage() {
  const listedStocksQuery = useSuspenseQuery(listedStocksQueryOptions);
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
  const [editingListedStock, setEditingListedStock] =
    useState<ListedStock | null>(null);
  const [deletingListedStock, setDeletingListedStock] =
    useState<ListedStock | null>(null);
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
  const isFetching =
    listedStocksQuery.isFetching || corporationsQuery.isFetching;
  const filteredListedStocks = useMemo(() => {
    const query = filterQuery.toLocaleLowerCase("ko-KR");

    if (!query) {
      return listedStocksQuery.data;
    }

    return listedStocksQuery.data.filter((listedStock) => {
      const corporation = corporationsByCode.get(listedStock.corporationCode);

      return [
        listedStock.code,
        listedStock.name,
        listedStock.marketType,
        listedStock.stockType,
        listedStock.corporationCode,
        listedStock.listDd,
        listedStock.parval?.toString() ?? "",
        listedStock.listShrs?.toString() ?? "",
        corporation?.name ?? "",
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query));
    });
  }, [corporationsByCode, filterQuery, listedStocksQuery.data]);
  const sortedListedStocks = useMemo(() => {
    if (sortBy === null) {
      return filteredListedStocks;
    }

    return [...filteredListedStocks].sort((first, second) => {
      let comparison: number;

      if (sortBy === "name") {
        comparison = listedStockNameCollator.compare(first.name, second.name);
      } else {
        comparison = first.listDd.localeCompare(second.listDd);
      }

      if (comparison === 0) {
        comparison = first.code.localeCompare(second.code);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredListedStocks, sortBy, sortDirection]);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedListedStocks.length / pageSize),
  );
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleListedStocks = sortedListedStocks.slice(
    startIndex,
    startIndex + pageSize,
  );

  const refresh = async () => {
    await Promise.all([
      listedStocksQuery.refetch(),
      corporationsQuery.refetch(),
    ]);
  };

  const updateSort = (sortBy: ListedStockSortField) => {
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
          eyebrow="Listed stocks"
          recordCount={listedStocksQuery.data.length}
          title="Listed Stocks"
        />
        <DataTableToolbar
          label="상장 종목 검색"
          onFilterChange={updateFilterQuery}
          placeholder="종목 코드, 종목명, 시장, 주식 종류, 상장 정보, 연결 법인 검색"
          query={tableState.q}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="헤더를 눌러 종목명과 상장일 기준으로 정렬할 수 있습니다."
          recordCount={filteredListedStocks.length}
          title="상장 종목 원장"
        >
          {listedStocksQuery.data.length === 0 ? (
            <ListedStocksEmptyState onCreate={() => setCreateOpen(true)} />
          ) : filteredListedStocks.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <ListedStocksTable
                corporationsByCode={corporationsByCode}
                listedStocks={visibleListedStocks}
                onDelete={setDeletingListedStock}
                onEdit={setEditingListedStock}
                onSort={updateSort}
                onView={setViewingCorporation}
                sortBy={tableState.sortBy}
                sortDirection={tableState.sortDirection}
              />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredListedStocks.length,
                )}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={filteredListedStocks.length}
                onPageChange={updatePage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <ListedStockCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ListedStockEditDialog
        corporations={corporationsQuery.data}
        listedStock={editingListedStock ?? undefined}
        open={editingListedStock !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingListedStock(null);
          }
        }}
      />
      <ListedStockDeleteDialog
        listedStock={deletingListedStock}
        onClose={() => setDeletingListedStock(null)}
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
