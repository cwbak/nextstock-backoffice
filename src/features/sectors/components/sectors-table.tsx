import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SectorDepthBadge } from "@/features/sectors/components/sector-depth-badge";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { SectorRowActions } from "@/features/sectors/components/sector-row-actions";
import { SectorName } from "@/features/sectors/components/sector-name";
import { SectorParentPathButton } from "@/features/sectors/components/sector-parent-path-button";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

function SectorTableRow({
  row,
  selected,
}: {
  row: SectorRow;
  selected: boolean;
}) {
  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell
        className="truncate pl-4 font-mono text-xs"
        title={String(row.sector.id)}
      >
        {row.sector.id}
      </TableCell>
      <TableCell>
        <Button
          aria-controls="sector-stocks-panel"
          aria-label={`${row.sector.name} 선택`}
          aria-pressed={selected}
          className="max-w-full justify-start"
          title={row.sector.name}
          type="button"
          variant="ghost"
          onClick={() => sectorUiActions.selectSector(row.sector.id)}
        >
          <SectorName sector={row.sector} />
        </Button>
      </TableCell>
      <TableCell>
        <SectorDepthBadge depth={row.sector.depth} />
      </TableCell>
      <TableCell className="overflow-hidden text-muted-foreground">
        <SectorParentPathButton row={row} />
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {row.descendantCount.toLocaleString("ko-KR")}
      </TableCell>
      <TableCell className="pr-4">
        <SectorRowActions sector={row.sector} />
      </TableCell>
    </TableRow>
  );
}

export function SectorsTable({ rows }: { rows: ReadonlyArray<SectorRow> }) {
  const selectedId = useSectorUiStore((state) => state.selectedSectorId);
  return (
    <Table className="min-w-[58rem] table-fixed">
      <TableCaption className="sr-only">
        등록된 섹터의 분류와 상위 관계
      </TableCaption>
      <colgroup>
        <col className="w-24" />
        <col className="w-64" />
        <col className="w-24" />
        <col />
        <col className="w-28" />
        <col className="w-32" />
      </colgroup>
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">ID</TableHead>
          <TableHead>섹터명</TableHead>
          <TableHead>분류</TableHead>
          <TableHead>상위 경로</TableHead>
          <TableHead className="text-right">전체 하위</TableHead>
          <TableHead className="pr-4 text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <SectorTableRow
            key={row.sector.id}
            row={row}
            selected={selectedId === row.sector.id}
          />
        ))}
      </TableBody>
    </Table>
  );
}
