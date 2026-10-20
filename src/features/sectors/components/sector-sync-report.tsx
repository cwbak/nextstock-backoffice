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
        <p>
          섹터별 종목 연결도 최신 목록으로 교체합니다. 미등록 종목은 건너뛰고
          완료 결과에 누락된 연결 수를 표시합니다.
        </p>
      </AlertDescription>
    </Alert>
  );
}

export function SectorSyncProgress() {
  return (
    <Alert role="status">
      <Spinner aria-hidden="true" />
      <AlertTitle>동기화 작업 등록 중</AlertTitle>
      <AlertDescription>
        작업을 등록한 뒤 처리 단계와 진행률을 표시합니다.
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
          Toss의 최신 섹터와 종목 연결을 반영했습니다.
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
      <dl className="grid grid-cols-2 gap-4 rounded-md border p-3 text-sm">
        <div>
          <dt className="text-muted-foreground">동기화한 종목 연결</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {result.stocksSynced.toLocaleString("ko-KR")}건
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">미등록 종목으로 건너뛴 연결</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {result.stocksSkipped.toLocaleString("ko-KR")}건
          </dd>
        </div>
      </dl>
      {result.stocksSkipped > 0 ? (
        <p className="text-sm text-muted-foreground">
          미등록 종목을 등록한 뒤 다시 동기화하면 누락된 연결을 반영할 수
          있습니다. 같은 종목이 여러 섹터에 속하면 연결마다 집계합니다.
        </p>
      ) : null}
    </div>
  );
}
