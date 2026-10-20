import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SectorStock } from "@/data-access/schemas/sector";

export function SectorStocksTable({
  stocks,
  sectorName,
}: {
  stocks: ReadonlyArray<SectorStock>;
  sectorName: string;
}) {
  return (
    <Table aria-label={`${sectorName} 종목 목록`}>
      <TableCaption className="sr-only">
        {sectorName} 섹터에 속한 종목 코드와 이름
      </TableCaption>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead className="w-36 pl-4">종목 코드</TableHead>
          <TableHead>종목명</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.code}>
            <TableCell className="pl-4 font-mono tabular-nums">
              {stock.code}
            </TableCell>
            <TableCell>{stock.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
