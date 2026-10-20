import { useQuery } from "@tanstack/react-query";

import { DataTableCard } from "@/components/common/data-table-card";
import { sectorStocksQueryOptions } from "@/data-access/queries/sectors/queries";
import { SectorLoadingState } from "@/features/sectors/components/sector-list-states";
import {
  SectorStocksEmptyState,
  SectorStocksLoadError,
  SectorStocksSelectionState,
} from "@/features/sectors/components/sector-stocks-states";
import { SectorStocksTable } from "@/features/sectors/components/sector-stocks-table";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { useSectorUiStore } from "@/features/sectors/stores/use-sector-ui-store";

function SelectedSectorStocks({ row }: { row: SectorRow }) {
  const { sector } = row;
  const query = useQuery({
    ...sectorStocksQueryOptions(sector.id),
    retry: false,
  });

  return (
    <DataTableCard
      contentClassName="max-h-[50svh] overflow-y-auto"
      description={`${sectorDepthLabels[sector.depth]} · #${sector.id} · ${row.path.join(" › ")}`}
      recordCount={query.data?.length ?? 0}
      title={`${sector.name} 종목`}
    >
      {query.isPending ? (
        <SectorLoadingState label="섹터 종목 불러오는 중" />
      ) : query.isError ? (
        <SectorStocksLoadError
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.length ? (
        <SectorStocksTable stocks={query.data} sectorName={sector.name} />
      ) : (
        <SectorStocksEmptyState />
      )}
    </DataTableCard>
  );
}

export function SectorStocksPanel({
  rows,
}: {
  rows: ReadonlyArray<SectorRow>;
}) {
  const selectedId = useSectorUiStore((state) => state.selectedSectorId);
  const row = rows.find((item) => item.sector.id === selectedId);
  return (
    <section
      aria-label="선택한 섹터의 종목"
      id="sector-stocks-panel"
      aria-live="polite"
    >
      {row ? (
        <SelectedSectorStocks key={row.sector.id} row={row} />
      ) : (
        <DataTableCard
          description="섹터를 선택하면 종목 코드와 이름을 표시합니다."
          title="섹터별 종목"
          recordCount={0}
        >
          <SectorStocksSelectionState />
        </DataTableCard>
      )}
    </section>
  );
}
