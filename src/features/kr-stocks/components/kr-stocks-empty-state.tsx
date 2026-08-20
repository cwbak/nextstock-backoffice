import { ChartCandlestickIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface KrStocksEmptyStateProps {
  onUpsert: () => void;
}

export function KrStocksEmptyState({ onUpsert }: KrStocksEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartCandlestickIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 KR 종목이 없습니다</EmptyTitle>
        <EmptyDescription>
          먼저 등록된 DART 법인 코드와 종목 코드를 입력해 종목을 생성하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onUpsert}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          종목 생성·갱신
        </Button>
      </EmptyContent>
    </Empty>
  );
}
