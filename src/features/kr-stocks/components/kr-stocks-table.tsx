import { useCallback } from "react";

import { PencilIcon } from "lucide-react";

import { DataTableDetailButton } from "@/components/common/data-table-detail-button";
import { KrStockStatusBadge } from "@/components/common/kr-stock-status-badge";
import { SortableTableHead } from "@/components/common/sortable-table-head";
import type { SortDirection } from "@/components/common/use-data-table-state";
import { useVirtualizedDataTable } from "@/components/common/use-virtualized-data-table";
import {
  VirtualizedDataTableRow,
  VirtualizedDataTableSpacer,
  VirtualizedDataTableViewport,
} from "@/components/common/virtualized-data-table";
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
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type KrStockSortField = "name" | "listDd";

interface KrStockRowActionsProps {
  krStock: KrStock;
  onEdit: (krStock: KrStock) => void;
}

function KrStockRowActions({ krStock, onEdit }: KrStockRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        aria-label={`${krStock.name} 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(krStock);
        }}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}

interface KrStocksTableProps {
  corporationsByCode: ReadonlyMap<string, Corporation>;
  krStocks: ReadonlyArray<KrStock>;
  onEdit: (krStock: KrStock) => void;
  onSort: (field: KrStockSortField) => void;
  onView: (corporation: Corporation) => void;
  resetKey: string;
  sortBy: KrStockSortField | null;
  sortDirection: SortDirection;
}

export function KrStocksTable({
  corporationsByCode,
  krStocks,
  onEdit,
  onSort,
  onView,
  resetKey,
  sortBy,
  sortDirection,
}: KrStocksTableProps) {
  const getItemKey = useCallback(
    (index: number) => krStocks[index]?.code ?? index,
    [krStocks],
  );
  const { bottomSpacerHeight, rootRef, topSpacerHeight, virtualRows } =
    useVirtualizedDataTable({
      count: krStocks.length,
      getItemKey,
      resetKey,
    });

  return (
    <VirtualizedDataTableViewport label="등록된 KR 종목 목록" rootRef={rootRef}>
      <Table
        aria-rowcount={krStocks.length + 1}
        className="min-w-[96rem] table-fixed"
      >
        <TableCaption className="sr-only">등록된 KR 종목 목록</TableCaption>
        <colgroup>
          <col className="w-28" />
          <col className="w-60" />
          <col className="w-24" />
          <col className="w-28" />
          <col className="w-24" />
          <col className="w-72" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-36" />
          <col className="w-44" />
          <col className="w-20" />
        </colgroup>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow className="bg-muted/35 hover:bg-muted/35">
            <TableHead className="pl-4">종목 코드</TableHead>
            <SortableTableHead
              direction={sortBy === "name" ? sortDirection : null}
              label="종목명"
              onSort={() => onSort("name")}
            />
            <TableHead>시장</TableHead>
            <TableHead>상태</TableHead>
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
          <VirtualizedDataTableSpacer
            columnCount={11}
            height={topSpacerHeight}
          />
          {virtualRows.map((virtualRow) => {
            const krStock = krStocks[virtualRow.index];

            if (!krStock) {
              return null;
            }

            const corporation = corporationsByCode.get(krStock.corporationCode);

            return (
              <VirtualizedDataTableRow
                aria-rowindex={virtualRow.index + 2}
                className={cn(corporation && "cursor-pointer")}
                key={virtualRow.key.toString()}
                onClick={corporation ? () => onView(corporation) : undefined}
              >
                <TableCell className="pl-4 font-mono text-xs font-semibold tabular-nums">
                  {krStock.code}
                </TableCell>
                <TableCell className="overflow-hidden">
                  {corporation ? (
                    <DataTableDetailButton
                      label={`${krStock.name} 연결 기업 상세 보기`}
                      primaryText={krStock.name}
                      onClick={() => onView(corporation)}
                    />
                  ) : (
                    <span className="block truncate font-medium">
                      {krStock.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      krStock.marketType === "KOSPI" ? "default" : "secondary"
                    }
                  >
                    {krStock.marketType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <KrStockStatusBadge status={krStock.status} />
                </TableCell>
                <TableCell>{krStock.stockType}</TableCell>
                <TableCell className="overflow-hidden">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {corporation?.name ?? "연결 법인 없음"}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {krStock.corporationCode}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(krStock.listDd)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {krStock.parval === null
                    ? "-"
                    : `${krStock.parval.toLocaleString("ko-KR")}원`}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {krStock.listShrs === null
                    ? "-"
                    : `${krStock.listShrs.toLocaleString("ko-KR")}주`}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(krStock.updatedAt)}
                </TableCell>
                <TableCell className="pr-4">
                  <KrStockRowActions krStock={krStock} onEdit={onEdit} />
                </TableCell>
              </VirtualizedDataTableRow>
            );
          })}
          <VirtualizedDataTableSpacer
            columnCount={11}
            height={bottomSpacerHeight}
          />
        </TableBody>
      </Table>
    </VirtualizedDataTableViewport>
  );
}
