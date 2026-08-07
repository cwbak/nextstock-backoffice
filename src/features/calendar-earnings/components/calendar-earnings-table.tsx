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
import { formatDate } from "@/lib/format";

interface CalendarEarningsTableProps {
  items: ReadonlyArray<CalendarEarning>;
}

export function CalendarEarningsTable({ items }: CalendarEarningsTableProps) {
  return (
    <Table className="min-w-[44rem] table-fixed">
      <TableCaption className="sr-only">등록된 실적 일정</TableCaption>
      <colgroup>
        <col className="w-44" />
        <col className="w-36" />
        <col className="w-44" />
        <col className="w-36" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">종목</TableHead>
          <TableHead>시장</TableHead>
          <TableHead>발표일</TableHead>
          <TableHead className="pr-4">발표 시간</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.stockType}:${item.key}:${item.reportDate}`}>
            <TableCell className="pl-4 font-mono text-xs font-semibold">
              {item.key}
            </TableCell>
            <TableCell>{item.stockType}</TableCell>
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
