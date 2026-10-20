import { CheckIcon, CircleAlertIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import type {
  ThemeSyncProgress,
  ThemeSyncResult,
} from "@/data-access/queries/themes/sync";
import {
  getThemeSyncChangeCount,
  type ThemeSyncAssessment,
} from "@/data-access/queries/themes/sync-plan";

type ThemeSyncCounts = Pick<
  ThemeSyncResult,
  "themesCreated" | "themesDeleted" | "stocksAdded" | "stocksDeleted"
>;

function ThemeSyncChangeCounts(counts: ThemeSyncCounts) {
  return (
    <Table aria-label="동기화 변경 건수">
      <TableHeader>
        <TableRow>
          <TableHead>대상</TableHead>
          <TableHead className="text-right">추가</TableHead>
          <TableHead className="text-right">삭제</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          {
            label: "테마",
            added: counts.themesCreated,
            deleted: counts.themesDeleted,
          },
          {
            label: "종목 연결",
            added: counts.stocksAdded,
            deleted: counts.stocksDeleted,
          },
        ].map((row) => (
          <TableRow key={row.label}>
            <TableCell>{row.label}</TableCell>
            <TableCell className="text-right tabular-nums">
              {row.added.toLocaleString("ko-KR")}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.deleted.toLocaleString("ko-KR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ThemeSyncIssues({
  assessment,
}: {
  assessment: ThemeSyncAssessment;
}) {
  const report = [
    ...assessment.missingStocks.map(
      ({ stockCode, themeIds }) =>
        `미등록 종목 ${stockCode} · 테마 ${themeIds.map((id) => `#${id} ${assessment.input.themes[String(id)]?.name ?? ""}`).join(", ")}`,
    ),
    ...assessment.nameConflicts.map(
      ({ name, themeIds }) =>
        `테마명 중복 "${name}" · 테마 ${themeIds.map((id) => `#${id}`).join(", ")}`,
    ),
  ].join("\n");
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>사전 검사에서 동기화를 중단했습니다</AlertTitle>
        <AlertDescription>
          미등록 종목 {assessment.missingStocks.length}개, 테마명 중복{" "}
          {assessment.nameConflicts.length}건입니다. 아래 항목을 해결한 뒤 다시
          검사해 주세요. 데이터는 변경하지 않았습니다.
        </AlertDescription>
      </Alert>
      <Textarea
        aria-label="동기화 사전 검사 오류 리포트"
        className="h-40 resize-y font-mono text-xs"
        readOnly
        value={report}
      />
    </div>
  );
}

export function ThemeSyncReview({
  assessment,
}: {
  assessment: ThemeSyncAssessment;
}) {
  const details = [
    ...assessment.themesToCreate.map(
      (theme) => `테마 추가 · #${theme.id} ${theme.name}`,
    ),
    ...assessment.themesToDelete.map(
      (theme) => `테마 삭제 · #${theme.id} ${theme.name}`,
    ),
    ...assessment.stocksToAdd.map(
      (link) => `종목 연결 추가 · #${link.themeId} / ${link.stockCode}`,
    ),
    ...assessment.stocksToDelete.map(
      (link) => `종목 연결 삭제 · #${link.themeId} / ${link.stockCode}`,
    ),
    ...(assessment.cascadedStockCount
      ? [
          `테마 삭제로 종목 연결 ${assessment.cascadedStockCount}건도 함께 삭제됩니다.`,
        ]
      : []),
  ].join("\n");
  return (
    <section aria-label="동기화 변경 내역" className="flex flex-col gap-3">
      <p className="text-sm">
        JSON 기준 테마 {assessment.themeCount.toLocaleString("ko-KR")}개 · 종목
        연결 {assessment.stockLinkCount.toLocaleString("ko-KR")}개
      </p>
      <ThemeSyncChangeCounts
        themesCreated={assessment.themesToCreate.length}
        themesDeleted={assessment.themesToDelete.length}
        stocksAdded={assessment.stocksToAdd.length}
        stocksDeleted={
          assessment.stocksToDelete.length + assessment.cascadedStockCount
        }
      />
      {getThemeSyncChangeCount(assessment) === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          이미 JSON과 일치합니다. 변경할 내용이 없습니다.
        </p>
      ) : (
        <Textarea
          aria-label="동기화 상세 변경 내역"
          className="h-36 resize-y font-mono text-xs"
          readOnly
          value={details}
        />
      )}
    </section>
  );
}

export function ThemeSyncResultSummary({
  result,
}: {
  result: ThemeSyncResult;
}) {
  return (
    <div className="flex flex-col gap-3" role="status">
      <Alert>
        <CheckIcon aria-hidden="true" />
        <AlertTitle>JSON과 동기화했습니다</AlertTitle>
        <AlertDescription>
          테마 {result.themeCount.toLocaleString("ko-KR")}개와 종목 연결{" "}
          {result.stockLinkCount.toLocaleString("ko-KR")}개가 JSON과 일치하는지
          확인했습니다.
        </AlertDescription>
      </Alert>
      <ThemeSyncChangeCounts {...result} />
    </div>
  );
}

export function ThemeSyncProgressAlert({
  progress,
}: {
  progress: ThemeSyncProgress | null;
}) {
  const label =
    progress?.stage === "verifying"
      ? "JSON과 최종 결과를 확인하고 있습니다"
      : progress?.stage === "syncing"
        ? "변경 내역을 반영하고 있습니다"
        : "실행 전 미등록 코드와 변경 내역을 다시 확인하고 있습니다";
  return (
    <Alert aria-live="polite">
      <Spinner />
      <AlertTitle>{label}</AlertTitle>
      <AlertDescription>
        창을 열어 둔 채 완료될 때까지 기다려 주세요.
        {progress && progress.total > 0 ? (
          <span className="block tabular-nums">
            {progress.completed.toLocaleString("ko-KR")} /{" "}
            {progress.total.toLocaleString("ko-KR")}건
          </span>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
