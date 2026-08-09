import { Building2Icon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function CorporationsEmptyState() {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 법인이 없습니다</EmptyTitle>
        <EmptyDescription>
          주식 메뉴에서 종목을 등록하면 연결 법인도 함께 생성됩니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
