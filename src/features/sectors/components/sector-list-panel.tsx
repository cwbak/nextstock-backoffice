import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  SectorLoadError,
  SectorLoadingState,
  SectorsEmptyState,
} from "@/features/sectors/components/sector-list-states";
import { SectorsTable } from "@/features/sectors/components/sectors-table";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";

interface SectorListPanelProps {
  error: unknown;
  isPending: boolean;
  onClear: () => void;
  onRetry: () => void;
  query: string;
  rows: ReadonlyArray<SectorRow>;
  totalCount: number;
}

export function SectorListPanel({
  error,
  isPending,
  onClear,
  onRetry,
  query,
  rows,
  totalCount,
}: SectorListPanelProps) {
  return (
    <DataTableCard
      contentClassName="max-h-[70svh] overflow-y-auto"
      description="상위 섹터 아래에 하위 섹터를 표시합니다. 섹터명과 상위 경로로 검색할 수 있습니다."
      recordCount={rows.length}
      title="전체 섹터"
    >
      {isPending ? (
        <SectorLoadingState />
      ) : error ? (
        <SectorLoadError error={error} onRetry={onRetry} />
      ) : totalCount === 0 ? (
        <SectorsEmptyState />
      ) : rows.length === 0 ? (
        <NoSearchResults query={query} onClear={onClear} />
      ) : (
        <SectorsTable rows={rows} />
      )}
    </DataTableCard>
  );
}
