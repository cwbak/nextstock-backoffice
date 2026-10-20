import { useMemo } from "react";

import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  SectorLoadError,
  SectorLoadingState,
  SectorsEmptyState,
  SectorDepthEmptyState,
} from "@/features/sectors/components/sector-list-states";
import { SectorHierarchyBrowser } from "@/features/sectors/components/sector-hierarchy-browser";
import { SectorsTable } from "@/features/sectors/components/sectors-table";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import {
  filterSectorRows,
  getSectorDepthRows,
} from "@/features/sectors/sector-browser";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";
import { useSectorUiStore } from "@/features/sectors/stores/use-sector-ui-store";

interface SectorListPanelProps {
  error: unknown;
  isPending: boolean;
  onClear: () => void;
  onRetry: () => void;
  query: string;
  rows: ReadonlyArray<SectorRow>;
}

export function SectorListPanel({
  error,
  isPending,
  onClear,
  onRetry,
  query,
  rows,
}: SectorListPanelProps) {
  const view = useSectorUiStore((state) => state.browserView);
  const matches = useMemo(() => filterSectorRows(rows, query), [rows, query]);
  const visibleRows = useMemo(
    () => (view === "all" ? matches : getSectorDepthRows(matches, view)),
    [matches, view],
  );
  return (
    <DataTableCard
      contentClassName={view === "all" ? "" : "max-h-[70svh] overflow-y-auto"}
      description={
        view === "all"
          ? "대분류와 중분류를 선택해 하위 섹터를 확인하세요. 선택한 섹터의 종목은 아래에 표시됩니다."
          : "선택한 분류의 섹터만 표시합니다. 섹터명을 선택하면 아래에 종목을 표시합니다."
      }
      recordCount={visibleRows.length}
      title={
        view === "all" ? "전체 섹터 탐색" : `${sectorDepthLabels[view]} 섹터`
      }
    >
      {isPending ? (
        <SectorLoadingState />
      ) : error ? (
        <SectorLoadError error={error} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <SectorsEmptyState />
      ) : visibleRows.length === 0 && query.trim() ? (
        <NoSearchResults query={query} onClear={onClear} />
      ) : view === "all" ? (
        <SectorHierarchyBrowser matches={matches} query={query} rows={rows} />
      ) : visibleRows.length === 0 ? (
        <SectorDepthEmptyState depth={view} />
      ) : (
        <SectorsTable rows={visibleRows} />
      )}
    </DataTableCard>
  );
}
