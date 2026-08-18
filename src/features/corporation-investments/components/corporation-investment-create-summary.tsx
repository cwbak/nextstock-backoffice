import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Corporation } from "@/data-access/schemas/corporation";
import type { EquityInvestmentCreateResult } from "@/data-access/schemas/equity-investment";

interface CorporationInvestmentCreateSummaryProps {
  corporation: Corporation | undefined;
  onClose: () => void;
  result: EquityInvestmentCreateResult;
}

export function CorporationInvestmentCreateSummary({
  corporation,
  onClose,
  result,
}: CorporationInvestmentCreateSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>지분투자 DRAFT 생성을 완료했습니다</AlertTitle>
      <AlertDescription>
        {corporation?.name ?? result.corpCode} · {result.bsnsYear}년 · 조회{" "}
        {result.fetchedCount.toLocaleString("ko-KR")}건 중{" "}
        {result.upsertedCount.toLocaleString("ko-KR")}건 생성
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="DRAFT 생성 결과 닫기"
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
