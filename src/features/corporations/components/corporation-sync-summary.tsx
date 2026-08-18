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
      <AlertTitle>DART 법인과 법인명을 동기화했습니다</AlertTitle>
      <AlertDescription>
        <p>
          DART 법인명{" "}
          {result.corporationNameFetchedCount.toLocaleString("ko-KR")}건을
          확인해 새 이름{" "}
          {result.corporationNameInsertedCount.toLocaleString("ko-KR")}건을
          추가했습니다.
        </p>
        <p>
          등록된 법인 {result.corporationFetchedCount.toLocaleString("ko-KR")}
          개의 기업개황을 확인해 변경된{" "}
          {result.corporationUpdatedCount.toLocaleString("ko-KR")}개 법인을
          갱신했습니다.
        </p>
      </AlertDescription>
      <AlertAction>
        <Button
          aria-label="DART 법인·법인명 동기화 결과 닫기"
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
