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
import type { EquityInvestment } from "@/data-access/schemas/equity-investment";

interface CorporationCellProps {
  code: string;
  corporation: Corporation | undefined;
}

function CorporationCell({ code, corporation }: CorporationCellProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-medium">
        {corporation?.name ?? "법인 정보 없음"}
      </span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {code}
      </span>
    </div>
  );
}

interface CorporationInvestmentsTableProps {
  corporationsByCode: ReadonlyMap<string, Corporation>;
  investments: ReadonlyArray<EquityInvestment>;
}

export function CorporationInvestmentsTable({
  corporationsByCode,
  investments,
}: CorporationInvestmentsTableProps) {
  return (
    <Table className="min-w-[56rem] table-fixed">
      <TableCaption className="sr-only">등록된 법인 지분투자 목록</TableCaption>
      <colgroup>
        <col className="w-72" />
        <col className="w-72" />
        <col className="w-24" />
        <col className="w-20" />
        <col className="w-36" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">지분 보유 법인</TableHead>
          <TableHead>투자 대상</TableHead>
          <TableHead>사업연도</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">기말 지분율</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investments.map((investment) => (
          <TableRow
            key={`${investment.corpCode}:${investment.invName}:${investment.bsnsYear}:${investment.status}`}
          >
            <TableCell className="overflow-hidden pl-4">
              <CorporationCell
                code={investment.corpCode}
                corporation={corporationsByCode.get(investment.corpCode)}
              />
            </TableCell>
            <TableCell className="overflow-hidden">
              <span
                className="block truncate font-medium"
                title={investment.invName}
              >
                {investment.invName}
              </span>
            </TableCell>
            <TableCell className="tabular-nums">
              {investment.bsnsYear}년
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{investment.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {investment.trmendBlceQotaRt === null
                ? "-"
                : `${investment.trmendBlceQotaRt}%`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
