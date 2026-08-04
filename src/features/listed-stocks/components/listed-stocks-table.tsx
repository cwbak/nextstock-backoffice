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
import type { ListedStock } from "@/data-access/schemas/listed-stock";
import { formatDate, formatDateTime } from "@/lib/format";

export type ListedStockSortField = "name" | "listDd";

interface ListedStockRowActionsProps {
  listedStock: ListedStock;
  onDelete: (listedStock: ListedStock) => void;
  onEdit: (listedStock: ListedStock) => void;
}

function ListedStockRowActions({
  listedStock,
  onDelete,
  onEdit,
}: ListedStockRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        aria-label={`${listedStock.name} 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(listedStock);
        }}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${listedStock.name} 삭제`}
        size="icon-sm"
        title="삭제"
        type="button"
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(listedStock);
        }}
      >
        <Trash2Icon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}

interface ListedStocksTableProps {
  corporationsByCode: ReadonlyMap<string, Corporation>;
  listedStocks: ReadonlyArray<ListedStock>;
  onDelete: (listedStock: ListedStock) => void;
  onEdit: (listedStock: ListedStock) => void;
  onSort: (field: ListedStockSortField) => void;
  onView: (corporation: Corporation) => void;
  sortBy: ListedStockSortField | null;
  sortDirection: SortDirection;
}

export function ListedStocksTable({
  corporationsByCode,
  listedStocks,
  onDelete,
  onEdit,
  onSort,
  onView,
  sortBy,
  sortDirection,
}: ListedStocksTableProps) {
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
        {listedStocks.map((listedStock) => {
          const corporation = corporationsByCode.get(
            listedStock.corporationCode,
          );

          return (
            <TableRow
              className={corporation ? "cursor-pointer" : undefined}
              key={listedStock.code}
              onClick={corporation ? () => onView(corporation) : undefined}
            >
              <TableCell className="pl-4 font-mono text-xs font-semibold tabular-nums">
                {listedStock.code}
              </TableCell>
              <TableCell className="overflow-hidden">
                {corporation ? (
                  <DataTableDetailButton
                    label={`${listedStock.name} 연결 기업 상세 보기`}
                    primaryText={listedStock.name}
                    onClick={() => onView(corporation)}
                  />
                ) : (
                  <span className="block truncate font-medium">
                    {listedStock.name}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    listedStock.marketType === "KOSPI" ? "default" : "secondary"
                  }
                >
                  {listedStock.marketType}
                </Badge>
              </TableCell>
              <TableCell>{listedStock.stockType}</TableCell>
              <TableCell className="overflow-hidden">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">
                    {corporation?.name ?? "연결 법인 없음"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {listedStock.corporationCode}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatDate(listedStock.listDd)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {listedStock.parval === null
                  ? "-"
                  : `${listedStock.parval.toLocaleString("ko-KR")}원`}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {listedStock.listShrs === null
                  ? "-"
                  : `${listedStock.listShrs.toLocaleString("ko-KR")}주`}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(listedStock.updatedAt)}
              </TableCell>
              <TableCell className="pr-4">
                <ListedStockRowActions
                  listedStock={listedStock}
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
