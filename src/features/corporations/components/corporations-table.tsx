import { useCallback } from "react";

import { PencilIcon, Trash2Icon } from "lucide-react";

import { DataTableDetailButton } from "@/components/common/data-table-detail-button";
import { SortableTableHead } from "@/components/common/sortable-table-head";
import type { SortDirection } from "@/components/common/use-data-table-state";
import { useVirtualizedDataTable } from "@/components/common/use-virtualized-data-table";
import {
  VirtualizedDataTableRow,
  VirtualizedDataTableSpacer,
  VirtualizedDataTableViewport,
} from "@/components/common/virtualized-data-table";
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
import type { Corporation } from "@/data-access/schemas/corporation";
import { formatDate, formatDateTime } from "@/lib/format";

export type CorporationSortField = "name" | "estDt";

interface CorporationRowActionsProps {
  corporation: Corporation;
  onDelete: (corporation: Corporation) => void;
  onEdit: (corporation: Corporation) => void;
}

function CorporationRowActions({
  corporation,
  onDelete,
  onEdit,
}: CorporationRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        aria-label={`${corporation.name} 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(corporation);
        }}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${corporation.name} 삭제`}
        size="icon-sm"
        title="삭제"
        type="button"
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(corporation);
        }}
      >
        <Trash2Icon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}

interface CorporationsTableProps {
  corporations: ReadonlyArray<Corporation>;
  onDelete: (corporation: Corporation) => void;
  onEdit: (corporation: Corporation) => void;
  onSort: (field: CorporationSortField) => void;
  onView: (corporation: Corporation) => void;
  resetKey: string;
  sortBy: CorporationSortField | null;
  sortDirection: SortDirection;
}

export function CorporationsTable({
  corporations,
  onDelete,
  onEdit,
  onSort,
  onView,
  resetKey,
  sortBy,
  sortDirection,
}: CorporationsTableProps) {
  const getItemKey = useCallback(
    (index: number) => corporations[index]?.code ?? index,
    [corporations],
  );
  const { bottomSpacerHeight, rootRef, topSpacerHeight, virtualRows } =
    useVirtualizedDataTable({
      count: corporations.length,
      getItemKey,
      resetKey,
    });

  return (
    <VirtualizedDataTableViewport label="등록된 법인 목록" rootRef={rootRef}>
      <Table
        aria-rowcount={corporations.length + 1}
        className="min-w-[59rem] table-fixed"
      >
        <TableCaption className="sr-only">등록된 법인 목록</TableCaption>
        <colgroup>
          <col className="w-28" />
          <col className="w-72" />
          <col className="w-24" />
          <col className="w-28" />
          <col className="w-20" />
          <col className="w-44" />
          <col className="w-20" />
        </colgroup>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow className="bg-muted/35 hover:bg-muted/35">
            <TableHead className="pl-4">법인 코드</TableHead>
            <SortableTableHead
              direction={sortBy === "name" ? sortDirection : null}
              label="법인명"
              onSort={() => onSort("name")}
            />
            <TableHead>업종 코드</TableHead>
            <SortableTableHead
              direction={sortBy === "estDt" ? sortDirection : null}
              label="설립일"
              onSort={() => onSort("estDt")}
            />
            <TableHead>결산월</TableHead>
            <TableHead>최종 수정</TableHead>
            <TableHead className="pr-4 text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <VirtualizedDataTableSpacer
            columnCount={7}
            height={topSpacerHeight}
          />
          {virtualRows.map((virtualRow) => {
            const corporation = corporations[virtualRow.index];

            if (!corporation) {
              return null;
            }

            return (
              <VirtualizedDataTableRow
                aria-rowindex={virtualRow.index + 2}
                className="cursor-pointer"
                key={virtualRow.key.toString()}
                onClick={() => onView(corporation)}
              >
                <TableCell className="pl-4 font-mono text-xs font-medium tabular-nums">
                  {corporation.code}
                </TableCell>
                <TableCell className="overflow-hidden">
                  <DataTableDetailButton
                    label={`${corporation.name} 상세 보기`}
                    primaryText={corporation.name}
                    secondaryText={corporation.nameEn}
                    onClick={() => onView(corporation)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {corporation.indutyCode}
                </TableCell>
                <TableCell>{formatDate(corporation.estDt)}</TableCell>
                <TableCell className="tabular-nums">
                  {corporation.accMt}월
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(corporation.updatedAt)}
                </TableCell>
                <TableCell className="pr-4">
                  <CorporationRowActions
                    corporation={corporation}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </TableCell>
              </VirtualizedDataTableRow>
            );
          })}
          <VirtualizedDataTableSpacer
            columnCount={7}
            height={bottomSpacerHeight}
          />
        </TableBody>
      </Table>
    </VirtualizedDataTableViewport>
  );
}
