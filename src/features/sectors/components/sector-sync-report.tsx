import { CheckIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SectorSyncResult } from "@/data-access/schemas/sector";

export function SectorSyncNotice() {
  return (
    <Alert>
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>Toss 목록을 기준으로 전체 동기화합니다</AlertTitle>
      <AlertDescription>
        <p>
          새 섹터를 추가하고 이름, 분류, 상위 관계를 갱신합니다. 수동 수정한
          값도 Toss의 값으로 바뀝니다.
        </p>
        <p>
          Toss에 없는 섹터는 수동 생성 항목도 삭제됩니다. Toss가 빈 목록을
          반환하면 전체 섹터가 삭제됩니다.
        </p>
      </AlertDescription>
    </Alert>
  );
}

export function SectorSyncProgress() {
  return (
    <Alert role="status">
      <Spinner aria-hidden="true" />
      <AlertTitle>Toss 섹터 동기화 중</AlertTitle>
      <AlertDescription>
        최신 목록을 가져와 반영하고 있습니다. 완료될 때까지 기다려 주세요.
      </AlertDescription>
    </Alert>
  );
}

export function SectorSyncResultSummary({
  result,
}: {
  result: SectorSyncResult;
}) {
  return (
    <div className="flex flex-col gap-3" role="status">
      <Alert>
        <CheckIcon aria-hidden="true" />
        <AlertTitle>섹터 동기화를 완료했습니다</AlertTitle>
        <AlertDescription>
          Toss의 최신 섹터 목록을 반영했습니다.
        </AlertDescription>
      </Alert>
      <Table aria-label="섹터 동기화 결과">
        <TableHeader>
          <TableRow>
            <TableHead>추가</TableHead>
            <TableHead>수정</TableHead>
            <TableHead>삭제</TableHead>
            <TableHead>유지</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {[
              result.created,
              result.updated,
              result.deleted,
              result.unchanged,
            ].map((count, index) => (
              <TableCell className="tabular-nums" key={index}>
                {count.toLocaleString("ko-KR")}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
