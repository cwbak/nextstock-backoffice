import type {
  Theme,
  ThemeCreatePayload,
  ThemeStockCreatePayload,
} from "@/data-access/schemas/theme";
import type { ThemeSyncInput } from "@/data-access/schemas/theme-sync";

export interface ThemeSyncState {
  themes: ReadonlyArray<Theme>;
  stocksByTheme: ReadonlyMap<number, ReadonlyArray<string>>;
  registeredStockCodes: ReadonlySet<string>;
}

export interface ThemeSyncAssessment {
  input: ThemeSyncInput;
  fingerprint: string;
  themeCount: number;
  stockLinkCount: number;
  themesToCreate: ThemeCreatePayload[];
  themesToDelete: Theme[];
  stocksToAdd: ThemeStockCreatePayload[];
  stocksToDelete: ThemeStockCreatePayload[];
  cascadedStockCount: number;
  missingStocks: Array<{ stockCode: string; themeIds: number[] }>;
  nameConflicts: Array<{ name: string; themeIds: number[] }>;
}

export function getThemeSyncChangeCount(plan: ThemeSyncAssessment) {
  return (
    plan.themesToCreate.length +
    plan.themesToDelete.length +
    plan.stocksToAdd.length +
    plan.stocksToDelete.length
  );
}

export function isThemeSyncBlocked(plan: ThemeSyncAssessment) {
  return plan.missingStocks.length > 0 || plan.nameConflicts.length > 0;
}

export function assessThemeSync(
  input: ThemeSyncInput,
  state: ThemeSyncState,
): ThemeSyncAssessment {
  const existingThemes = new Map(
    state.themes.map((theme) => [theme.id, theme]),
  );
  const desiredThemes = Object.entries(input.themes)
    .map(([id, theme]) => ({ id: Number(id), ...theme }))
    .sort((first, second) => first.id - second.id);
  const desiredIds = new Set(desiredThemes.map((theme) => theme.id));
  const themesToDelete = state.themes
    .filter((theme) => !desiredIds.has(theme.id))
    .sort((first, second) => first.id - second.id);
  const missingCodes = new Map<string, number[]>();
  const names = new Map<string, number[]>();
  const plan: ThemeSyncAssessment = {
    input,
    fingerprint: JSON.stringify(
      [...state.themes]
        .sort((first, second) => first.id - second.id)
        .map((theme) => [
          theme.id,
          theme.name,
          [...(state.stocksByTheme.get(theme.id) ?? [])].sort(),
        ]),
    ),
    themeCount: desiredThemes.length,
    stockLinkCount: 0,
    themesToCreate: [],
    themesToDelete,
    stocksToAdd: [],
    stocksToDelete: [],
    cascadedStockCount: themesToDelete.reduce(
      (count, theme) =>
        count + (state.stocksByTheme.get(theme.id)?.length ?? 0),
      0,
    ),
    missingStocks: [],
    nameConflicts: [],
  };

  for (const theme of desiredThemes) {
    const existing = existingThemes.get(theme.id);
    const name = existing?.name ?? theme.name;
    names.set(name, [...(names.get(name) ?? []), theme.id]);
    if (!existing) {
      plan.themesToCreate.push({ id: theme.id, name });
    }
    const desiredCodes = new Set(theme.stocks.map((stock) => stock.stock_code));
    const existingCodes = new Set(state.stocksByTheme.get(theme.id) ?? []);
    plan.stockLinkCount += desiredCodes.size;
    for (const stockCode of [...desiredCodes].sort()) {
      if (!state.registeredStockCodes.has(stockCode)) {
        missingCodes.set(stockCode, [
          ...(missingCodes.get(stockCode) ?? []),
          theme.id,
        ]);
      }
      if (!existingCodes.has(stockCode)) {
        plan.stocksToAdd.push({ themeId: theme.id, stockCode });
      }
    }
    for (const stockCode of [...existingCodes].sort()) {
      if (!desiredCodes.has(stockCode)) {
        plan.stocksToDelete.push({ themeId: theme.id, stockCode });
      }
    }
  }
  plan.missingStocks = [...missingCodes]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([stockCode, themeIds]) => ({ stockCode, themeIds }));
  plan.nameConflicts = [...names]
    .filter(([, ids]) => ids.length > 1)
    .map(([name, themeIds]) => ({ name, themeIds }));
  return plan;
}
