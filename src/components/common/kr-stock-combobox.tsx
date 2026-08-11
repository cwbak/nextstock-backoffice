import { useMemo, useState } from "react";

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { cn } from "@/lib/utils";

const maximumVisibleStocks = 50;

interface KrStockComboboxProps {
  "aria-invalid"?: boolean;
  emptyMessage?: string;
  id: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  stocks: ReadonlyArray<KrStock>;
  value: string;
}

export function KrStockCombobox({
  "aria-invalid": ariaInvalid,
  emptyMessage = "검색 결과가 없습니다.",
  id,
  onValueChange,
  placeholder = "KR 종목을 선택하세요",
  stocks,
  value,
}: KrStockComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchableStocks = useMemo(
    () =>
      stocks.map((stock) => ({
        searchText:
          `${stock.code} ${stock.name} ${stock.corporationCode} ${stock.marketType}`.toLocaleLowerCase(
            "ko-KR",
          ),
        stock,
      })),
    [stocks],
  );
  const selectedStock = useMemo(
    () => stocks.find((stock) => stock.code === value) ?? null,
    [stocks, value],
  );
  const matchingStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    const matches = normalizedQuery
      ? searchableStocks.filter(({ searchText }) =>
          searchText.includes(normalizedQuery),
        )
      : searchableStocks;

    return matches.slice(0, maximumVisibleStocks);
  }, [query, searchableStocks]);

  const selectStock = (stockCode: string) => {
    onValueChange(stockCode);
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
            {selectedStock
              ? `${selectedStock.code} · ${selectedStock.name}`
              : placeholder}
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
            aria-label="KR 종목 검색"
            className="pl-8"
            placeholder="종목 코드, 종목명, 법인 코드 검색"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
        <div
          aria-label="KR 종목 검색 결과"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto"
          id={`${id}-options`}
          role="listbox"
        >
          {matchingStocks.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            matchingStocks.map(({ stock }) => (
              <Button
                aria-selected={stock.code === value}
                className="h-auto w-full justify-start px-2 py-2 text-left font-normal"
                key={stock.code}
                role="option"
                type="button"
                variant="ghost"
                onClick={() => selectStock(stock.code)}
              >
                <CheckIcon
                  aria-hidden="true"
                  className={cn(
                    stock.code === value ? "opacity-100" : "opacity-0",
                  )}
                  data-icon="inline-start"
                />
                <span className="min-w-0">
                  <span className="block truncate">{stock.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {stock.code} · {stock.corporationCode} · {stock.marketType}
                  </span>
                </span>
              </Button>
            ))
          )}
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          {query.trim()
            ? `최대 ${maximumVisibleStocks}개 결과를 표시합니다.`
            : "종목 코드 또는 종목명을 입력해 검색하세요."}
        </p>
      </PopoverContent>
    </Popover>
  );
}
