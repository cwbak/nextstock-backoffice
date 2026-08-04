import { CircleCheckIcon, TriangleAlertIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { EquityInvestmentBulkCreateResult } from "@/data-access/schemas/equity-investment";

interface CorporationInvestmentsBulkCreateSummaryProps {
  onClose: () => void;
  result: EquityInvestmentBulkCreateResult;
}

export function CorporationInvestmentsBulkCreateSummary({
  onClose,
  result,
}: CorporationInvestmentsBulkCreateSummaryProps) {
  const hasFailures = result.failedCount > 0;

  return (
    <Alert>
      {hasFailures ? (
        <TriangleAlertIcon aria-hidden="true" />
      ) : (
        <CircleCheckIcon aria-hidden="true" />
      )}
      <AlertTitle>
        {hasFailures
          ? "일부 법인을 제외하고 지분투자 DRAFT 생성을 완료했습니다"
          : "전체 법인 지분투자 DRAFT 생성을 완료했습니다"}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-1">
        <span>
          {result.bsnsYear}년 · 전체{" "}
          {result.corporationCount.toLocaleString("ko-KR")}개 법인 중 성공{" "}
          {result.processedCount.toLocaleString("ko-KR")}개, 실패{" "}
          {result.failedCount.toLocaleString("ko-KR")}개
        </span>
        <span>
          DART 조회 {result.fetchedCount.toLocaleString("ko-KR")}건 · 생성{" "}
          {result.upsertedCount.toLocaleString("ko-KR")}건 · 미매칭{" "}
          {result.unmatchedCount.toLocaleString("ko-KR")}건
        </span>
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="전체 DRAFT 생성 결과 닫기"
          size="icon-sm"
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
