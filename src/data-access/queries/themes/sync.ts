import type { QueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/data-access/api/client";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import {
  createTheme,
  createThemeStock,
  deleteTheme,
  deleteThemeStock,
} from "@/data-access/queries/themes/mutations";
import {
  themesQueryOptions,
  themeStocksQueryOptions,
} from "@/data-access/queries/themes/queries";
import {
  assessThemeSync,
  getThemeSyncChangeCount,
  isThemeSyncBlocked,
  type ThemeSyncAssessment,
  type ThemeSyncState,
} from "@/data-access/queries/themes/sync-plan";
import type { ThemeSyncInput } from "@/data-access/schemas/theme-sync";

export class ThemeSyncPreflightError extends Error {
  readonly assessment: ThemeSyncAssessment;

  constructor(assessment: ThemeSyncAssessment) {
    super(
      "사전 검사에서 문제가 발견되어 동기화를 중단했습니다. 변경된 데이터는 없습니다.",
    );
    this.name = "ThemeSyncPreflightError";
    this.assessment = assessment;
  }
}

export interface ThemeSyncProgress {
  stage: "checking" | "syncing" | "verifying";
  completed: number;
  total: number;
}

async function readThemeSyncState(
  queryClient: QueryClient,
): Promise<ThemeSyncState> {
  const [themes, stocks] = await Promise.all([
    queryClient.fetchQuery({
      ...themesQueryOptions,
      staleTime: 0,
      retry: false,
    }),
    queryClient.fetchQuery({
      ...krStocksQueryOptions,
      staleTime: 0,
      retry: false,
    }),
  ]);
  const stocksByTheme = new Map<number, string[]>();
  for (let offset = 0; offset < themes.length; offset += 6) {
    const batch = themes.slice(offset, offset + 6);
    await Promise.all(
      batch.map(async (theme) => {
        const members = await queryClient.fetchQuery({
          ...themeStocksQueryOptions(theme.id),
          staleTime: 0,
          retry: false,
        });
        stocksByTheme.set(
          theme.id,
          members.map((stock) => stock.code),
        );
      }),
    );
  }
  return {
    themes,
    stocksByTheme,
    registeredStockCodes: new Set(stocks.map((stock) => stock.code)),
  };
}

export async function prepareThemeSync(
  input: ThemeSyncInput,
  queryClient: QueryClient,
) {
  return assessThemeSync(input, await readThemeSyncState(queryClient));
}

export async function synchronizeThemes(
  preview: ThemeSyncAssessment,
  queryClient: QueryClient,
  onProgress: (progress: ThemeSyncProgress) => void,
) {
  onProgress({ stage: "checking", completed: 0, total: 0 });
  const plan = await prepareThemeSync(preview.input, queryClient);
  if (isThemeSyncBlocked(plan)) {
    throw new ThemeSyncPreflightError(plan);
  }
  if (plan.fingerprint !== preview.fingerprint) {
    throw new Error(
      "검사 후 테마 또는 종목 연결이 변경되었습니다. 다시 사전 검사해 주세요. 변경된 데이터는 없습니다.",
    );
  }

  const operations: Array<{ label: string; run: () => Promise<unknown> }> = [
    ...plan.themesToDelete.map((theme) => ({
      label: `테마 #${theme.id} 삭제`,
      run: () => deleteTheme(theme.id),
    })),
    ...plan.themesToCreate.map((theme) => ({
      label: `테마 #${theme.id} 추가`,
      run: () => createTheme(theme),
    })),
    ...plan.stocksToAdd.map((link) => ({
      label: `테마 #${link.themeId} 종목 ${link.stockCode} 추가`,
      run: () => createThemeStock(link),
    })),
    ...plan.stocksToDelete.map((link) => ({
      label: `테마 #${link.themeId} 종목 ${link.stockCode} 삭제`,
      run: () => deleteThemeStock(link),
    })),
  ];
  const total = getThemeSyncChangeCount(plan);
  let completed = 0;
  for (const operation of operations) {
    onProgress({ stage: "syncing", completed, total });
    try {
      await operation.run();
    } catch (error) {
      throw new Error(
        `${operation.label} 실패: ${getErrorMessage(error)}. ${completed}/${total}건의 요청이 완료되었습니다. 일부 변경이 반영되었을 수 있으니 다시 사전 검사해 주세요.`,
        { cause: error },
      );
    }
    completed += 1;
  }
  onProgress({ stage: "verifying", completed, total });
  try {
    const verified = await prepareThemeSync(plan.input, queryClient);
    if (
      isThemeSyncBlocked(verified) ||
      getThemeSyncChangeCount(verified) !== 0
    ) {
      throw new Error("JSON과 일치하지 않는 테마 또는 종목 연결이 있습니다.");
    }
  } catch (error) {
    throw new Error(
      `변경 요청 ${completed}건은 완료했지만 최종 검증에 실패했습니다. ${getErrorMessage(error)} 다시 사전 검사해 주세요.`,
      { cause: error },
    );
  }
  return {
    themesCreated: plan.themesToCreate.length,
    themesDeleted: plan.themesToDelete.length,
    stocksAdded: plan.stocksToAdd.length,
    stocksDeleted: plan.stocksToDelete.length + plan.cascadedStockCount,
    themeCount: plan.themeCount,
    stockLinkCount: plan.stockLinkCount,
  };
}

export type ThemeSyncResult = Awaited<ReturnType<typeof synchronizeThemes>>;
