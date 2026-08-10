import { AlertTriangleIcon, ChartCandlestickIcon } from "lucide-react";

import { DataTableCard } from "@/components/common/data-table-card";
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
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import type { Theme } from "@/data-access/schemas/theme";
import { ThemeStocksTable } from "@/features/themes/components/theme-stocks-table";

interface ThemeStocksPanelProps {
  error: unknown;
  isPending: boolean;
  onRetry: () => void;
  parentThemeName: string | undefined;
  stocks: ReadonlyArray<KrxStock> | undefined;
  theme: Theme;
}

export function ThemeStocksPanel({
  error,
  isPending,
  onRetry,
  parentThemeName,
  stocks,
  theme,
}: ThemeStocksPanelProps) {
  const description = parentThemeName
    ? `상위 테마 ${parentThemeName} · 시스템 테마 #${theme.id}`
    : `시스템 테마 #${theme.id}`;

  return (
    <DataTableCard
      className="lg:h-full lg:min-h-0"
      contentClassName="lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
      description={description}
      recordCount={stocks?.length ?? 0}
      title={theme.name}
    >
      {isPending ? (
        <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          연결 종목을 불러오는 중입니다.
        </div>
      ) : error ? (
        <Empty className="min-h-72 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>연결 종목을 불러오지 못했습니다</EmptyTitle>
            <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onRetry}>
              다시 시도
            </Button>
          </EmptyContent>
        </Empty>
      ) : stocks?.length ? (
        <ThemeStocksTable stocks={stocks} themeName={theme.name} />
      ) : (
        <Empty className="min-h-72 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartCandlestickIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>연결된 KRX 종목이 없습니다</EmptyTitle>
            <EmptyDescription>
              이 테마에 연결된 종목이 아직 등록되지 않았습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </DataTableCard>
  );
}
