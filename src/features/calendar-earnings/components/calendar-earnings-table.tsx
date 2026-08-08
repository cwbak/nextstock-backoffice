import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalendarEarning } from "@/data-access/schemas/calendar-earning";
import { formatDate, formatUsdMarketCap } from "@/lib/format";

interface CalendarEarningsTableProps {
  items: ReadonlyArray<CalendarEarning>;
}

export function CalendarEarningsTable({ items }: CalendarEarningsTableProps) {
  return (
    <Table className="min-w-[76rem] table-fixed">
      <TableCaption className="sr-only">등록된 실적 일정</TableCaption>
      <colgroup>
        <col className="w-32" />
        <col className="w-72" />
        <col className="w-44" />
        <col className="w-24" />
        <col className="w-44" />
        <col className="w-36" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">종목</TableHead>
          <TableHead>종목명</TableHead>
          <TableHead className="text-right">시가총액</TableHead>
          <TableHead>S&amp;P 500</TableHead>
          <TableHead>발표일</TableHead>
          <TableHead className="pr-4">발표 시간</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.symbol}:${item.reportDate}`}>
            <TableCell className="pl-4 font-mono text-xs font-semibold">
              {item.symbol}
            </TableCell>
            <TableCell className="overflow-hidden">
              <span className="block truncate font-medium" title={item.name}>
                {item.name}
              </span>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatUsdMarketCap(item.marketCap)}
            </TableCell>
            <TableCell>{item.isSp500 ? "편입" : "-"}</TableCell>
            <TableCell className="font-medium tabular-nums">
              {formatDate(item.reportDate)}
            </TableCell>
            <TableCell className="pr-4 font-mono text-xs tabular-nums">
              {item.reportTime ?? "미정"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
