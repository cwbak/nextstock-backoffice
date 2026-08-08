import { SortableTableHead } from "@/components/common/sortable-table-head";
import type { SortDirection } from "@/components/common/use-data-table-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NasdaqInfo } from "@/data-access/schemas/nasdaq-info";
import { formatDateTime, formatUsdMarketCap } from "@/lib/format";

interface NasdaqInfoTableProps {
  items: ReadonlyArray<NasdaqInfo>;
  onSort: () => void;
  sortBy: "marketCap" | null;
  sortDirection: SortDirection;
}

export function NasdaqInfoTable({
  items,
  onSort,
  sortBy,
  sortDirection,
}: NasdaqInfoTableProps) {
  return (
    <Table className="min-w-[100rem] table-fixed">
      <TableCaption className="sr-only">등록된 나스닥 종목 정보</TableCaption>
      <colgroup>
        <col className="w-28" />
        <col className="w-64" />
        <col className="w-44" />
        <col className="w-40" />
        <col className="w-24" />
        <col className="w-52" />
        <col className="w-80" />
        <col className="w-44" />
        <col className="w-44" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">심볼</TableHead>
          <TableHead>종목명</TableHead>
          <SortableTableHead
            direction={sortBy === "marketCap" ? sortDirection : null}
            label="시가총액"
            onSort={onSort}
          />
          <TableHead>국가</TableHead>
          <TableHead>IPO 연도</TableHead>
          <TableHead>섹터</TableHead>
          <TableHead>산업</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className="pr-4">최종 수정</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.symbol}>
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
            <TableCell>{item.country ?? "-"}</TableCell>
            <TableCell className="tabular-nums">
              {item.ipoYear ?? "-"}
            </TableCell>
            <TableCell className="overflow-hidden">
              <span className="block truncate" title={item.sector ?? undefined}>
                {item.sector ?? "-"}
              </span>
            </TableCell>
            <TableCell className="overflow-hidden text-muted-foreground">
              <span
                className="block truncate"
                title={item.industry ?? undefined}
              >
                {item.industry ?? "-"}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(item.createdAt)}
            </TableCell>
            <TableCell className="pr-4 text-muted-foreground">
              {formatDateTime(item.updatedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
