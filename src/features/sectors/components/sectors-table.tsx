import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectorDepthBadge } from "@/features/sectors/components/sector-depth-badge";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { SectorRowActions } from "@/features/sectors/components/sector-row-actions";

function SectorTableRow({ row }: { row: SectorRow }) {
  return (
    <TableRow>
      <TableCell
        className="truncate pl-4 font-mono text-xs"
        title={String(row.sector.id)}
      >
        {row.sector.id}
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">{row.sector.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <SectorDepthBadge depth={row.sector.depth} />
      </TableCell>
      <TableCell className="overflow-hidden text-muted-foreground">
        <span
          className="block truncate"
          title={row.path.slice(0, -1).join(" › ")}
        >
          {row.ancestorIds.length
            ? row.path.slice(0, -1).join(" › ")
            : "최상위 섹터"}
        </span>
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
          <SectorTableRow key={row.sector.id} row={row} />
        ))}
      </TableBody>
    </Table>
  );
}
