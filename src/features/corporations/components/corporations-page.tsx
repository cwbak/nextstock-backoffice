import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CloudDownloadIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

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
import type {
  Corporation,
  CorporationSyncResult,
} from "@/data-access/schemas/corporation";
import { CorporationDeleteDialog } from "@/features/corporations/components/corporation-delete-dialog";
import { CorporationDetailSheet } from "@/features/corporations/components/corporation-detail-sheet";
import { CorporationEditDialog } from "@/features/corporations/components/corporation-edit-dialog";
import { CorporationSyncDialog } from "@/features/corporations/components/corporation-sync-dialog";
import { CorporationSyncSummary } from "@/features/corporations/components/corporation-sync-summary";
import { CorporationUpsertDialog } from "@/features/corporations/components/corporation-upsert-dialog";
import { CorporationsEmptyState } from "@/features/corporations/components/corporations-empty-state";
import {
  type CorporationSortField,
  CorporationsTable,
} from "@/features/corporations/components/corporations-table";

const pageSize = 50;
const corporationNameCollator = new Intl.Collator(["ko-KR", "en"], {
  numeric: true,
  sensitivity: "base",
});
const initialTableState: SortableDataTableState<CorporationSortField> = {
  page: 1,
  q: "",
  sortBy: null,
  sortDirection: "asc",
};

export function CorporationsPage() {
  const { data, isFetching, refetch } = useSuspenseQuery(
    corporationsQueryOptions,
  );
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
  const [editingCorporation, setEditingCorporation] =
    useState<Corporation | null>(null);
  const [deletingCorporation, setDeletingCorporation] =
    useState<Corporation | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<CorporationSyncResult | null>(
    null,
  );
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [viewingCorporation, setViewingCorporation] =
    useState<Corporation | null>(null);
  const filteredCorporations = useMemo(() => {
    const query = filterQuery.toLocaleLowerCase("ko-KR");

    if (!query) {
      return data;
    }

    return data.filter((corporation) =>
      [
        corporation.code,
        corporation.name,
        corporation.nameEn,
        corporation.indutyCode,
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query)),
    );
  }, [data, filterQuery]);
  const sortedCorporations = useMemo(() => {
    if (sortBy === null) {
      return filteredCorporations;
    }

    return [...filteredCorporations].sort((first, second) => {
      let comparison: number;

      if (sortBy === "name") {
        comparison = corporationNameCollator.compare(first.name, second.name);
      } else {
        comparison = first[sortBy].localeCompare(second[sortBy]);
      }

      if (comparison === 0) {
        comparison = first.code.localeCompare(second.code);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCorporations, sortBy, sortDirection]);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedCorporations.length / pageSize),
  );
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleCorporations = sortedCorporations.slice(
    startIndex,
    startIndex + pageSize,
  );

  const updateSort = (sortBy: CorporationSortField) => {
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
                onClick={() => void refetch()}
              >
                {isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button type="button" onClick={() => setSyncOpen(true)}>
                <CloudDownloadIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                />
                법인 전체 동기화
              </Button>
              <Button type="button" onClick={() => setUpsertOpen(true)}>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                법인 생성·갱신
              </Button>
            </>
          }
          description="DART 기업개황 기반 법인의 기본 정보와 부가 정보를 관리합니다."
          eyebrow="Corporations"
          recordCount={data.length}
          title="Corporations"
        />
        {syncResult ? (
          <CorporationSyncSummary
            result={syncResult}
            onClose={() => setSyncResult(null)}
          />
        ) : null}
        <DataTableToolbar
          label="법인 검색"
          onFilterChange={updateFilterQuery}
          placeholder="법인 코드, 법인명, 영문명, 업종 코드 검색"
          query={tableState.q}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="헤더를 눌러 법인명과 설립일 기준으로 정렬할 수 있습니다."
          recordCount={filteredCorporations.length}
          title="법인 원장"
        >
          {data.length === 0 ? (
            <CorporationsEmptyState onUpsert={() => setUpsertOpen(true)} />
          ) : filteredCorporations.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <CorporationsTable
                corporations={visibleCorporations}
                onDelete={setDeletingCorporation}
                onEdit={setEditingCorporation}
                onSort={updateSort}
                onView={setViewingCorporation}
                sortBy={tableState.sortBy}
                sortDirection={tableState.sortDirection}
              />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredCorporations.length,
                )}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={filteredCorporations.length}
                onPageChange={updatePage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <CorporationEditDialog
        corporation={editingCorporation ?? undefined}
        open={editingCorporation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCorporation(null);
          }
        }}
      />
      <CorporationDeleteDialog
        corporation={deletingCorporation}
        onClose={() => setDeletingCorporation(null)}
      />
      <CorporationSyncDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        onSynced={(result) => {
          setSyncResult(result);
          setSyncOpen(false);
        }}
      />
      <CorporationUpsertDialog open={upsertOpen} onOpenChange={setUpsertOpen} />
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
