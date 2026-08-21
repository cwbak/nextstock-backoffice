import { useDeferredValue, useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataTableToolbar } from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { krStockStatusLabels } from "@/components/common/kr-stock-status";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  type SortableUnpaginatedDataTableState,
  useUnpaginatedDataTableState,
} from "@/components/common/use-data-table-state";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import {
  viewportDataTableCardClassName,
  viewportDataTableCardContentClassName,
  viewportDataTablePageClassName,
} from "@/components/common/viewport-data-table-layout";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import type { Corporation } from "@/data-access/schemas/corporation";
import type {
  KrStock,
  KrStockSyncResult,
} from "@/data-access/schemas/kr-stock";
import { CorporationDetailSheet } from "@/features/corporations";
import { KrStockUpsertDialog } from "@/features/kr-stocks/components/kr-stock-create-dialog";
import { KrStockEditDialog } from "@/features/kr-stocks/components/kr-stock-edit-dialog";
import { KrStockSyncDialog } from "@/features/kr-stocks/components/kr-stock-sync-dialog";
import { KrStockSyncSummary } from "@/features/kr-stocks/components/kr-stock-sync-summary";
import { KrStockThemeAddDialog } from "@/features/kr-stocks/components/kr-stock-theme-add-dialog";
import { KrStocksPageActions } from "@/features/kr-stocks/components/kr-stocks-page-actions";
import { KrStocksEmptyState } from "@/features/kr-stocks/components/kr-stocks-empty-state";
import {
  type KrStockSortField,
  KrStocksTable,
} from "@/features/kr-stocks/components/kr-stocks-table";

const krStockNameCollator = new Intl.Collator(["ko-KR", "en"], {
  numeric: true,
  sensitivity: "base",
});
const initialTableState: SortableUnpaginatedDataTableState<KrStockSortField> = {
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
    updateQuery,
  } = useUnpaginatedDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const deferredFilterQuery = useDeferredValue(filterQuery);
  const { sortBy, sortDirection } = tableState;
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<KrStockSyncResult | null>(null);
  const [editingKrStock, setEditingKrStock] = useState<KrStock | null>(null);
  const [themeAddingKrStock, setThemeAddingKrStock] = useState<KrStock | null>(
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
  const isFetching = krStocksQuery.isFetching || corporationsQuery.isFetching;
  const filteredKrStocks = useMemo(() => {
    const query = deferredFilterQuery.toLocaleLowerCase("ko-KR");

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
        krStock.status,
        krStockStatusLabels[krStock.status],
        krStock.corporationCode,
        krStock.listDd,
        krStock.parval?.toString() ?? "",
        krStock.listShrs?.toString() ?? "",
        corporation?.name ?? "",
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query));
    });
  }, [corporationsByCode, deferredFilterQuery, krStocksQuery.data]);
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
  const tableResetKey = `${deferredFilterQuery}\u0000${sortBy ?? ""}\u0000${sortDirection}`;

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
      sortBy,
      sortDirection,
    }));
  };

  return (
    <>
      <section className={viewportDataTablePageClassName}>
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
          placeholder="종목 코드, 종목명, 시장, 상태, 주식 종류, 상장 정보, 연결 법인 검색"
          query={tableState.q}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          className={viewportDataTableCardClassName}
          contentClassName={viewportDataTableCardContentClassName}
          description="헤더를 눌러 종목명과 상장일 기준으로 정렬할 수 있습니다."
          recordCount={filteredKrStocks.length}
          title="KR 종목 원장"
        >
          {krStocksQuery.data.length === 0 ? (
            <KrStocksEmptyState onUpsert={() => setUpsertOpen(true)} />
          ) : filteredKrStocks.length === 0 ? (
            <NoSearchResults
              query={deferredFilterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <KrStocksTable
              corporationsByCode={corporationsByCode}
              krStocks={sortedKrStocks}
              resetKey={tableResetKey}
              onAddToTheme={setThemeAddingKrStock}
              onEdit={setEditingKrStock}
              onSort={updateSort}
              onView={setViewingCorporation}
              sortBy={tableState.sortBy}
              sortDirection={tableState.sortDirection}
            />
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
      <KrStockThemeAddDialog
        krStock={themeAddingKrStock}
        onOpenChange={(open) => {
          if (!open) {
            setThemeAddingKrStock(null);
          }
        }}
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
