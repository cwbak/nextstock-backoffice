import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataTableToolbar } from "@/components/common/data-table-controls";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import { useUnpaginatedDataTableState } from "@/components/common/use-data-table-state";
import { sectorsQueryOptions } from "@/data-access/queries/sectors/queries";
import { SectorDeleteDialog } from "@/features/sectors/components/sector-delete-dialog";
import { SectorFormDialog } from "@/features/sectors/components/sector-form-dialog";
import { SectorListPanel } from "@/features/sectors/components/sector-list-panel";
import { SectorsPageActions } from "@/features/sectors/components/sectors-page-actions";
import { buildSectorRows } from "@/features/sectors/sector-hierarchy";

export function SectorsPage() {
  const query = useQuery(sectorsQueryOptions);
  const { state, updateQuery } = useUnpaginatedDataTableState({ q: "" });
  const [filter, updateFilter] = useDataTableFilterQuery(state.q);
  const rows = useMemo(() => buildSectorRows(query.data ?? []), [query.data]);
  const filteredRows = useMemo(() => {
    const keyword = filter.trim().toLocaleLowerCase("ko-KR");
    return keyword
      ? rows.filter((row) =>
          `${row.sector.id} ${row.path.join(" ")}`
            .toLocaleLowerCase("ko-KR")
            .includes(keyword),
        )
      : rows;
  }, [filter, rows]);

  return (
    <>
      <section className="flex min-w-0 flex-col gap-6">
        <DataPageHeader
          actions={
            <SectorsPageActions
              isFetching={query.isFetching}
              onRefresh={() => void query.refetch()}
            />
          }
          description="섹터의 이름과 상위 관계를 관리합니다."
          eyebrow="Sector management"
          recordCount={query.data?.length ?? 0}
          title="섹터 관리"
        />
        <DataTableToolbar
          label="섹터 검색"
          placeholder="섹터 ID, 섹터명, 상위 경로 검색"
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
          rows={filteredRows}
          totalCount={query.data?.length ?? 0}
        />
      </section>
      <SectorFormDialog sectors={query.data ?? []} />
      <SectorDeleteDialog sectors={query.data ?? []} />
    </>
  );
}
