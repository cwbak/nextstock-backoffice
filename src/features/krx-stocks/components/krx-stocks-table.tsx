import { PencilIcon, Trash2Icon } from "lucide-react";

import { DataTableDetailButton } from "@/components/common/data-table-detail-button";
import { SortableTableHead } from "@/components/common/sortable-table-head";
import type { SortDirection } from "@/components/common/use-data-table-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import { formatDate, formatDateTime } from "@/lib/format";

export type KrxStockSortField = "name" | "listDd";

interface KrxStockRowActionsProps {
  krxStock: KrxStock;
  onDelete: (krxStock: KrxStock) => void;
  onEdit: (krxStock: KrxStock) => void;
}

function KrxStockRowActions({
  krxStock,
  onDelete,
  onEdit,
}: KrxStockRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        aria-label={`${krxStock.name} 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(krxStock);
        }}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${krxStock.name} 삭제`}
        size="icon-sm"
        title="삭제"
        type="button"
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(krxStock);
        }}
      >
        <Trash2Icon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}

interface KrxStocksTableProps {
  corporationsByCode: ReadonlyMap<string, Corporation>;
  krxStocks: ReadonlyArray<KrxStock>;
  onDelete: (krxStock: KrxStock) => void;
  onEdit: (krxStock: KrxStock) => void;
  onSort: (field: KrxStockSortField) => void;
  onView: (corporation: Corporation) => void;
  sortBy: KrxStockSortField | null;
  sortDirection: SortDirection;
}

export function KrxStocksTable({
  corporationsByCode,
  krxStocks,
  onDelete,
  onEdit,
  onSort,
  onView,
  sortBy,
  sortDirection,
}: KrxStocksTableProps) {
  return (
    <Table className="min-w-[91rem] table-fixed">
      <TableCaption className="sr-only">등록된 상장 종목 목록</TableCaption>
      <colgroup>
        <col className="w-28" />
        <col className="w-60" />
        <col className="w-24" />
        <col className="w-24" />
        <col className="w-72" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-36" />
        <col className="w-44" />
        <col className="w-20" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">종목 코드</TableHead>
          <SortableTableHead
            direction={sortBy === "name" ? sortDirection : null}
            label="종목명"
            onSort={() => onSort("name")}
          />
          <TableHead>시장</TableHead>
          <TableHead>주식 종류</TableHead>
          <TableHead>연결 법인</TableHead>
          <SortableTableHead
            direction={sortBy === "listDd" ? sortDirection : null}
            label="상장일"
            onSort={() => onSort("listDd")}
          />
          <TableHead className="text-right">액면가</TableHead>
          <TableHead className="text-right">상장주식수</TableHead>
          <TableHead>최종 수정</TableHead>
          <TableHead className="pr-4 text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {krxStocks.map((krxStock) => {
          const corporation = corporationsByCode.get(krxStock.corporationCode);

          return (
            <TableRow
              className={corporation ? "cursor-pointer" : undefined}
              key={krxStock.code}
              onClick={corporation ? () => onView(corporation) : undefined}
            >
              <TableCell className="pl-4 font-mono text-xs font-semibold tabular-nums">
                {krxStock.code}
              </TableCell>
              <TableCell className="overflow-hidden">
                {corporation ? (
                  <DataTableDetailButton
                    label={`${krxStock.name} 연결 기업 상세 보기`}
                    primaryText={krxStock.name}
                    onClick={() => onView(corporation)}
                  />
                ) : (
                  <span className="block truncate font-medium">
                    {krxStock.name}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    krxStock.marketType === "KOSPI" ? "default" : "secondary"
                  }
                >
                  {krxStock.marketType}
                </Badge>
              </TableCell>
              <TableCell>{krxStock.stockType}</TableCell>
              <TableCell className="overflow-hidden">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">
                    {corporation?.name ?? "연결 법인 없음"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {krxStock.corporationCode}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatDate(krxStock.listDd)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {krxStock.parval === null
                  ? "-"
                  : `${krxStock.parval.toLocaleString("ko-KR")}원`}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {krxStock.listShrs === null
                  ? "-"
                  : `${krxStock.listShrs.toLocaleString("ko-KR")}주`}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(krxStock.updatedAt)}
              </TableCell>
              <TableCell className="pr-4">
                <KrxStockRowActions
                  krxStock={krxStock}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
