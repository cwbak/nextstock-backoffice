import { Building2Icon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface CorporationsEmptyStateProps {
  onUpsert: () => void;
}

export function CorporationsEmptyState({
  onUpsert,
}: CorporationsEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 법인이 없습니다</EmptyTitle>
        <EmptyDescription>
          DART 법인 코드를 입력해 기업개황으로 법인을 생성하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onUpsert}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          법인 생성·갱신
        </Button>
      </EmptyContent>
    </Empty>
  );
}
