import { TagsIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ThemesEmptyState() {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TagsIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 시스템 테마가 없습니다</EmptyTitle>
        <EmptyDescription>표시할 테마 정보가 없습니다.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
