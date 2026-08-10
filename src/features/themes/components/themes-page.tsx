import { useMemo, useState } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import { DataTableToolbar } from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import {
  type DataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  themesQueryOptions,
  themeStocksQueryOptions,
} from "@/data-access/queries/themes/queries";
import { ThemeList } from "@/features/themes/components/theme-list";
import { ThemeStocksPanel } from "@/features/themes/components/theme-stocks-panel";
import { ThemesEmptyState } from "@/features/themes/components/themes-empty-state";

const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

export function ThemesPage() {
  const themesQuery = useSuspenseQuery(themesQueryOptions);
  const [selectedThemeId, setSelectedThemeId] = useState(
    () => themesQuery.data[0]?.id ?? null,
  );
  const { state: tableState, updateQuery } =
    useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const themesById = useMemo(
    () => new Map(themesQuery.data.map((theme) => [theme.id, theme])),
    [themesQuery.data],
  );
  const selectedTheme =
    (selectedThemeId === null ? undefined : themesById.get(selectedThemeId)) ??
    themesQuery.data[0] ??
    null;
  const selectedParentTheme =
    selectedTheme?.parentThemeId === null || !selectedTheme
      ? undefined
      : themesById.get(selectedTheme.parentThemeId);
  const themeStocksQuery = useQuery({
    ...themeStocksQueryOptions(selectedTheme?.id ?? 0),
    enabled: selectedTheme !== null,
  });
  const filteredThemes = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("ko-KR");

    if (!query) {
      return themesQuery.data;
    }

    return themesQuery.data.filter((theme) => {
      const parentName =
        theme.parentThemeId === null
          ? "최상위 테마"
          : (themesById.get(theme.parentThemeId)?.name ??
            theme.parentThemeId.toString());

      return [theme.id.toString(), theme.name, parentName].some((value) =>
        value.toLocaleLowerCase("ko-KR").includes(query),
      );
    });
  }, [filterQuery, themesById, themesQuery.data]);
  const isFetching = themesQuery.isFetching || themeStocksQuery.isFetching;

  return (
    <section className="flex flex-col gap-6 lg:h-[calc(100svh-7rem)] lg:min-h-[40rem]">
      <DataPageHeader
        actions={
          <Button
            disabled={isFetching}
            type="button"
            variant="outline"
            onClick={() => {
              void Promise.all([
                themesQuery.refetch(),
                selectedTheme ? themeStocksQuery.refetch() : Promise.resolve(),
              ]);
            }}
          >
            {isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
            )}
            새로고침
          </Button>
        }
        description="시스템 테마를 선택해 연결된 KRX 종목을 조회합니다."
        eyebrow="Theme listing"
        recordCount={themesQuery.data.length}
        title="테마 리스팅"
      />
      {themesQuery.data.length === 0 ? (
        <DataTableCard
          description="시스템에 등록된 전체 테마입니다."
          recordCount={0}
          title="시스템 테마"
        >
          <ThemesEmptyState />
        </DataTableCard>
      ) : (
        <>
          <DataTableToolbar
            label="테마 검색"
            placeholder="테마 ID, 테마명, 상위 테마 검색"
            query={tableState.q}
            onFilterChange={updateFilterQuery}
            onQueryChange={updateQuery}
          />
          <div className="grid min-w-0 items-start gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <DataTableCard
              className="lg:h-full lg:min-h-0"
              contentClassName="lg:min-h-0 lg:flex-1 lg:overflow-hidden"
              description="테마를 선택하면 연결 종목을 표시합니다."
              recordCount={filteredThemes.length}
              title="시스템 테마"
            >
              {filteredThemes.length === 0 ? (
                <NoSearchResults
                  query={filterQuery}
                  onClear={() => updateQuery("")}
                />
              ) : (
                <ThemeList
                  selectedThemeId={selectedTheme?.id ?? 0}
                  themes={filteredThemes}
                  themesById={themesById}
                  onSelect={setSelectedThemeId}
                />
              )}
            </DataTableCard>
            {selectedTheme ? (
              <ThemeStocksPanel
                error={themeStocksQuery.error}
                isPending={themeStocksQuery.isPending}
                parentThemeName={selectedParentTheme?.name}
                stocks={themeStocksQuery.data}
                theme={selectedTheme}
                onRetry={() => void themeStocksQuery.refetch()}
              />
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
