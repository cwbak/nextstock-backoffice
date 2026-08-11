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
  onCreate: () => void;
}

export function KrStocksEmptyState({ onCreate }: KrStocksEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartCandlestickIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 상장 종목이 없습니다</EmptyTitle>
        <EmptyDescription>
          DART 법인 코드와 종목 코드를 입력하면 법인과 종목이 함께 등록됩니다.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onCreate}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          종목 등록
        </Button>
      </EmptyContent>
    </Empty>
  );
}
