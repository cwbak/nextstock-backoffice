import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { KrMarketData } from "@/data-access/schemas/kr-market-data";
import { getKrMarketDataPeriodLabel } from "@/features/kr-market-data/kr-market-data-period";
import { formatDate } from "@/lib/format";

const numberFormatter = new Intl.NumberFormat("ko-KR");

interface KrMarketDataTableProps {
  items: ReadonlyArray<KrMarketData>;
  stockName: string;
}

export function KrMarketDataTable({
  items,
  stockName,
}: KrMarketDataTableProps) {
  return (
    <Table className="min-w-[64rem] table-fixed">
      <TableCaption className="sr-only">{stockName} KR 캔들</TableCaption>
      <colgroup>
        <col className="w-36" />
        <col className="w-24" />
        <col className="w-32" />
        <col className="w-32" />
        <col className="w-32" />
        <col className="w-32" />
        <col className="w-44" />
        <col className="w-52" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">날짜</TableHead>
          <TableHead>주기</TableHead>
          <TableHead className="text-right">시가</TableHead>
          <TableHead className="text-right">고가</TableHead>
          <TableHead className="text-right">저가</TableHead>
          <TableHead className="text-right">종가</TableHead>
          <TableHead className="text-right">거래량</TableHead>
          <TableHead className="pr-4 text-right">거래대금</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.date}>
            <TableCell className="pl-4 font-medium tabular-nums">
              {formatDate(item.date)}
            </TableCell>
            <TableCell>{getKrMarketDataPeriodLabel(item.period)}</TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {numberFormatter.format(item.open)}
            </TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {numberFormatter.format(item.high)}
            </TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {numberFormatter.format(item.low)}
            </TableCell>
            <TableCell className="text-right font-mono text-xs font-medium tabular-nums">
              {numberFormatter.format(item.close)}
            </TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {numberFormatter.format(item.volume)}
            </TableCell>
            <TableCell className="pr-4 text-right font-mono text-xs tabular-nums">
              {numberFormatter.format(item.value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
