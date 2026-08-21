import { useMemo, useState } from "react";

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Theme } from "@/data-access/schemas/theme";
import { cn } from "@/lib/utils";

const maximumVisibleThemes = 50;

interface ThemeComboboxProps {
  "aria-invalid"?: boolean;
  id: string;
  onValueChange: (value: number) => void;
  themes: ReadonlyArray<Theme>;
  value: number | null;
}

export function ThemeCombobox({
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  themes,
  value,
}: ThemeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchableThemes = useMemo(
    () =>
      themes.map((theme) => ({
        searchText: `${theme.id} ${theme.name}`.toLocaleLowerCase("ko-KR"),
        theme,
      })),
    [themes],
  );
  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === value) ?? null,
    [themes, value],
  );
  const matchingThemes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    const matches = normalizedQuery
      ? searchableThemes.filter(({ searchText }) =>
          searchText.includes(normalizedQuery),
        )
      : searchableThemes;

    return matches.slice(0, maximumVisibleThemes);
  }, [query, searchableThemes]);

  const selectTheme = (themeId: number) => {
    onValueChange(themeId);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          aria-controls={`${id}-options`}
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className="w-full justify-between"
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">
            {selectedTheme
              ? `#${selectedTheme.id} · ${selectedTheme.name}`
              : "테마를 선택하세요"}
          </span>
          <ChevronsUpDownIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-2"
      >
        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="테마 검색"
            className="pl-8"
            placeholder="테마 ID 또는 테마명 검색"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
        <div
          aria-label="테마 검색 결과"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto"
          id={`${id}-options`}
          role="listbox"
        >
          {matchingThemes.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              일치하는 테마가 없습니다.
            </p>
          ) : (
            matchingThemes.map(({ theme }) => (
              <Button
                aria-selected={theme.id === value}
                className="h-auto w-full justify-start px-2 py-2 text-left"
                key={theme.id}
                role="option"
                type="button"
                variant="ghost"
                onClick={() => selectTheme(theme.id)}
              >
                <CheckIcon
                  aria-hidden="true"
                  className={cn(
                    theme.id === value ? "opacity-100" : "opacity-0",
                  )}
                  data-icon="inline-start"
                />
                <span className="min-w-0">
                  <span className="block truncate">{theme.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    시스템 테마 #{theme.id}
                  </span>
                </span>
              </Button>
            ))
          )}
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          {query.trim()
            ? `최대 ${maximumVisibleThemes}개 결과를 표시합니다.`
            : "테마 ID 또는 이름을 입력해 검색하세요."}
        </p>
      </PopoverContent>
    </Popover>
  );
}
