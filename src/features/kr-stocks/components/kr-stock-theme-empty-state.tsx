import { TagsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface KrStockThemeEmptyStateProps {
  onClose: () => void;
}

export function KrStockThemeEmptyState({
  onClose,
}: KrStockThemeEmptyStateProps) {
  return (
    <Empty className="min-h-48 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TagsIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 시스템 테마가 없습니다</EmptyTitle>
        <EmptyDescription>
          테마 리스팅에서 시스템 테마를 먼저 등록해 주세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onClose}>
          닫기
        </Button>
      </EmptyContent>
    </Empty>
  );
}
