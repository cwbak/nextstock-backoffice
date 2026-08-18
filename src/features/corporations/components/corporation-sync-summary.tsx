import { CircleCheckIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CorporationSyncResult } from "@/data-access/schemas/corporation";

interface CorporationSyncSummaryProps {
  onClose: () => void;
  result: CorporationSyncResult;
}

export function CorporationSyncSummary({
  onClose,
  result,
}: CorporationSyncSummaryProps) {
  return (
    <Alert>
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>DART 법인 전체 동기화를 완료했습니다</AlertTitle>
      <AlertDescription>
        <p>
          등록된 법인 {result.fetchedCount.toLocaleString("ko-KR")}개의
          기업개황을 확인해 변경된 {result.updatedCount.toLocaleString("ko-KR")}
          개 법인을 갱신했습니다.
        </p>
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="DART 법인 전체 동기화 결과 닫기"
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
