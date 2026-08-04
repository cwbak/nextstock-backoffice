import { useMemo, useState } from "react";

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Corporation } from "@/data-access/schemas/corporation";
import { cn } from "@/lib/utils";

const maximumVisibleCorporations = 50;

interface CorporationComboboxProps {
  "aria-invalid"?: boolean;
  corporations: ReadonlyArray<Corporation>;
  id: string;
  onValueChange: (value: string) => void;
  value: string;
}

export function CorporationCombobox({
  "aria-invalid": ariaInvalid,
  corporations,
  id,
  onValueChange,
  value,
}: CorporationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchableCorporations = useMemo(
    () =>
      corporations.map((corporation) => ({
        corporation,
        searchText:
          `${corporation.code} ${corporation.name} ${corporation.nameEn}`.toLocaleLowerCase(
            "ko-KR",
          ),
      })),
    [corporations],
  );
  const selectedCorporation = useMemo(
    () =>
      corporations.find((corporation) => corporation.code === value) ?? null,
    [corporations, value],
  );
  const matchingCorporations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    const matches = normalizedQuery
      ? searchableCorporations.filter(({ searchText }) =>
          searchText.includes(normalizedQuery),
        )
      : searchableCorporations;

    return matches.slice(0, maximumVisibleCorporations);
  }, [query, searchableCorporations]);

  const selectCorporation = (corporationCode: string) => {
    onValueChange(corporationCode);
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
          className="w-full justify-between font-normal"
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">
            {selectedCorporation
              ? `${selectedCorporation.code} · ${selectedCorporation.name}`
              : "법인을 선택하세요"}
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
            aria-label="법인 검색"
            className="pl-8"
            placeholder="법인 코드, 법인명 검색"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
        <div
          aria-label="법인 검색 결과"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto"
          id={`${id}-options`}
          role="listbox"
        >
          {matchingCorporations.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              일치하는 법인이 없습니다.
            </p>
          ) : (
            matchingCorporations.map(({ corporation }) => (
              <Button
                aria-selected={corporation.code === value}
                className="h-auto w-full justify-start px-2 py-2 text-left font-normal"
                key={corporation.code}
                role="option"
                type="button"
                variant="ghost"
                onClick={() => selectCorporation(corporation.code)}
              >
                <CheckIcon
                  aria-hidden="true"
                  className={cn(
                    corporation.code === value ? "opacity-100" : "opacity-0",
                  )}
                  data-icon="inline-start"
                />
                <span className="min-w-0">
                  <span className="block truncate">{corporation.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {corporation.code}
                  </span>
                </span>
              </Button>
            ))
          )}
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          {query.trim()
            ? `최대 ${maximumVisibleCorporations}개 결과를 표시합니다.`
            : "법인 코드 또는 이름을 입력해 검색하세요."}
        </p>
      </PopoverContent>
    </Popover>
  );
}
