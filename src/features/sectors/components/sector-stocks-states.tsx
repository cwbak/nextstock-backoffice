import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getErrorMessage } from "@/data-access/api/client";

export function SectorStocksSelectionState() {
  return (
    <Empty className="min-h-40 border-0">
      <EmptyHeader>
        <EmptyTitle>종목을 확인할 섹터를 선택하세요</EmptyTitle>
        <EmptyDescription>
          대분류·중분류·소분류 모두 선택할 수 있습니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function SectorStocksEmptyState() {
  return (
    <Empty className="min-h-40 border-0">
      <EmptyHeader>
        <EmptyTitle>연결된 종목이 없습니다</EmptyTitle>
        <EmptyDescription>
          이 섹터에 등록된 종목 연결이 없습니다. 동기화로 최신 구성을 반영할 수
          있습니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function SectorStocksLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <Empty className="min-h-40 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>섹터 종목을 불러오지 못했습니다</EmptyTitle>
        <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      </EmptyContent>
    </Empty>
  );
}
