import { NetworkIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface CorporationInvestmentsEmptyStateProps {
  onCreate: () => void;
}

export function CorporationInvestmentsEmptyState({
  onCreate,
}: CorporationInvestmentsEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NetworkIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 지분투자가 없습니다</EmptyTitle>
        <EmptyDescription>
          법인을 선택해 DART의 최신 출자현황을 동기화하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onCreate}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          동기화
        </Button>
      </EmptyContent>
    </Empty>
  );
}
