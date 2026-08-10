import type { Theme } from "@/data-access/schemas/theme";
import { cn } from "@/lib/utils";

interface ThemeListProps {
  onSelect: (themeId: number) => void;
  selectedThemeId: number;
  themes: ReadonlyArray<Theme>;
  themesById: ReadonlyMap<number, Theme>;
}

export function ThemeList({
  onSelect,
  selectedThemeId,
  themes,
  themesById,
}: ThemeListProps) {
  return (
    <ul className="max-h-[50svh] divide-y overflow-y-auto lg:h-full lg:max-h-none">
      {themes.map((theme) => {
        const parentTheme =
          theme.parentThemeId === null
            ? undefined
            : themesById.get(theme.parentThemeId);
        const isSelected = theme.id === selectedThemeId;

        return (
          <li key={theme.id}>
            <button
              aria-label={`${theme.name} 테마 선택`}
              aria-pressed={isSelected}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isSelected && "bg-muted hover:bg-muted",
              )}
              type="button"
              onClick={() => onSelect(theme.id)}
            >
              <span className="truncate font-medium">{theme.name}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                #{theme.id}
              </span>
              <span className="col-span-2 mt-0.5 truncate text-xs text-muted-foreground">
                {parentTheme
                  ? `상위 테마 · ${parentTheme.name}`
                  : theme.parentThemeId === null
                    ? "최상위 테마"
                    : `상위 테마 #${theme.parentThemeId}`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
