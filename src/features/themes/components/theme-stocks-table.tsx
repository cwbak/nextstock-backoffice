import { Trash2Icon } from "lucide-react";

import { KrStockStatusBadge } from "@/components/common/kr-stock-status-badge";
import { Badge } from "@/components/ui/badge";
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
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { formatDate } from "@/lib/format";

interface ThemeStocksTableProps {
  onDelete: (stock: KrStock) => void;
  stocks: ReadonlyArray<KrStock>;
  themeName: string;
}

export function ThemeStocksTable({
  onDelete,
  stocks,
  themeName,
}: ThemeStocksTableProps) {
  return (
    <Table className="min-w-[79rem] table-fixed">
      <TableCaption className="sr-only">
        {themeName} 테마의 KR 종목 목록
      </TableCaption>
      <colgroup>
        <col className="w-28" />
        <col className="w-52" />
        <col className="w-24" />
        <col className="w-28" />
        <col className="w-24" />
        <col className="w-32" />
        <col className="w-28" />
        <col className="w-28" />
        <col className="w-36" />
        <col className="w-20" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">종목 코드</TableHead>
          <TableHead>종목명</TableHead>
          <TableHead>시장</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>주식 종류</TableHead>
          <TableHead>법인 코드</TableHead>
          <TableHead>상장일</TableHead>
          <TableHead className="text-right">액면가</TableHead>
          <TableHead className="pr-4 text-right">상장주식수</TableHead>
          <TableHead className="pr-4 text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.code}>
            <TableCell className="pl-4 font-mono text-xs font-semibold tabular-nums">
              {stock.code}
            </TableCell>
            <TableCell className="overflow-hidden">
              <span className="block truncate font-medium">{stock.name}</span>
            </TableCell>
            <TableCell>
              <Badge
                variant={stock.marketType === "KOSPI" ? "default" : "secondary"}
              >
                {stock.marketType}
              </Badge>
            </TableCell>
            <TableCell>
              <KrStockStatusBadge status={stock.status} />
            </TableCell>
            <TableCell>{stock.stockType}</TableCell>
            <TableCell className="font-mono text-xs tabular-nums">
              {stock.corporationCode}
            </TableCell>
            <TableCell>{formatDate(stock.listDd)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {stock.parval === null
                ? "-"
                : `${stock.parval.toLocaleString("ko-KR")}원`}
            </TableCell>
            <TableCell className="pr-4 text-right tabular-nums">
              {stock.listShrs === null
                ? "-"
                : `${stock.listShrs.toLocaleString("ko-KR")}주`}
            </TableCell>
            <TableCell className="pr-4 text-right">
              <Button
                aria-label={`${stock.name} 테마에서 삭제`}
                size="icon-sm"
                title="테마에서 삭제"
                type="button"
                variant="destructive"
                onClick={() => onDelete(stock)}
              >
                <Trash2Icon aria-hidden="true" data-icon="inline-start" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
