import {
  CornerDownRightIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

function SectorRowActions({ row }: { row: SectorRow }) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        aria-label={`${row.sector.name} 하위 섹터 추가`}
        size="icon-sm"
        title="하위 섹터 추가"
        type="button"
        variant="ghost"
        onClick={() => sectorUiActions.create(row.sector.id)}
      >
        <PlusIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${row.sector.name} 섹터 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={() => sectorUiActions.edit(row.sector.id)}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${row.sector.name} 섹터 삭제`}
        size="icon-sm"
        title="삭제"
        type="button"
        variant="ghost"
        onClick={() => sectorUiActions.confirmDelete(row.sector.id)}
      >
        <Trash2Icon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}

function SectorTableRow({ row }: { row: SectorRow }) {
  return (
    <TableRow>
      <TableCell className="pl-4 font-mono text-xs tabular-nums">
        {row.sector.id}
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2">
          {row.ancestorIds.length ? (
            <CornerDownRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          ) : null}
          <span className="truncate font-medium">{row.sector.name}</span>
        </div>
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
        <SectorRowActions row={row} />
      </TableCell>
    </TableRow>
  );
}

export function SectorsTable({ rows }: { rows: ReadonlyArray<SectorRow> }) {
  return (
    <Table className="min-w-[52rem] table-fixed">
      <TableCaption className="sr-only">등록된 섹터와 상위 관계</TableCaption>
      <colgroup>
        <col className="w-24" />
        <col className="w-64" />
        <col />
        <col className="w-28" />
        <col className="w-32" />
      </colgroup>
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">ID</TableHead>
          <TableHead>섹터명</TableHead>
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
