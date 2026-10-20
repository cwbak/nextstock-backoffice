import { useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataTableToolbar } from "@/components/common/data-table-controls";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import { useUnpaginatedDataTableState } from "@/components/common/use-data-table-state";
import { sectorsQueryOptions } from "@/data-access/queries/sectors/queries";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { SectorDeleteDialog } from "@/features/sectors/components/sector-delete-dialog";
import { SectorFormDialog } from "@/features/sectors/components/sector-form-dialog";
import { SectorListPanel } from "@/features/sectors/components/sector-list-panel";
import { SectorSyncDialog } from "@/features/sectors/components/sector-sync-dialog";
import { SectorStocksPanel } from "@/features/sectors/components/sector-stocks-panel";
import { SectorViewSwitch } from "@/features/sectors/components/sector-view-switch";
import { SectorsPageActions } from "@/features/sectors/components/sectors-page-actions";
import { buildSectorRows } from "@/features/sectors/sector-hierarchy";

export function SectorsPage() {
  const queryClient = useQueryClient();
  const query = useQuery(sectorsQueryOptions);
  const { state, updateQuery } = useUnpaginatedDataTableState({ q: "" });
  const [filter, updateFilter] = useDataTableFilterQuery(state.q);
  const rows = useMemo(() => buildSectorRows(query.data ?? []), [query.data]);

  return (
    <>
      <section className="flex min-w-0 flex-col gap-6">
        <DataPageHeader
          actions={
            <SectorsPageActions
              isFetching={query.isFetching}
              onRefresh={() => {
                void query.refetch();
                void queryClient.invalidateQueries({
                  queryKey: sectorKeys.stockLists(),
                });
              }}
            />
          }
          description="대분류·중분류·소분류별 섹터와 상위 관계를 관리합니다."
          eyebrow="Sector management"
          recordCount={query.data?.length ?? 0}
          title="섹터 관리"
        />
        <DataTableToolbar
          controls={<SectorViewSwitch />}
          label="섹터 검색"
          placeholder="섹터 ID, 섹터명, 분류, 상위 경로 검색"
          query={state.q}
          onFilterChange={updateFilter}
          onQueryChange={updateQuery}
        />
        <SectorListPanel
          error={query.error}
          isPending={query.isPending}
          onClear={() => updateQuery("")}
          onRetry={() => void query.refetch()}
          query={filter}
          rows={rows}
        />
        {query.isSuccess && rows.length > 0 ? (
          <SectorStocksPanel rows={rows} />
        ) : null}
      </section>
      <SectorFormDialog sectors={query.data ?? []} />
      <SectorDeleteDialog sectors={query.data ?? []} />
      <SectorSyncDialog />
    </>
  );
}
