import { AlertTriangleIcon, FolderTreeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

export function SectorsEmptyState() {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderTreeIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 섹터가 없습니다</EmptyTitle>
        <EmptyDescription>
          동기화로 Toss 섹터를 가져오거나 최상위 섹터부터 직접 추가하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={() => sectorUiActions.create()}
        >
          첫 섹터 추가
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function SectorLoadingState({
  label = "섹터 목록 불러오는 중",
}: {
  label?: string;
}) {
  return (
    <div
      aria-label={label}
      className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"
      role="status"
    >
      <Spinner />
      {label}
    </div>
  );
}

export function SectorLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <Empty className="min-h-48 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>섹터를 불러오지 못했습니다</EmptyTitle>
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
