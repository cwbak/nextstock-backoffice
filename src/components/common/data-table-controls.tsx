import { memo, useEffect, useEffectEvent, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps {
  label: string;
  onFilterChange: (query: string) => void;
  onQueryChange: (query: string) => void;
  placeholder: string;
  query: string;
}

const searchUpdateDelay = 250;

export const DataTableToolbar = memo(function DataTableToolbar({
  label,
  onFilterChange,
  onQueryChange,
  placeholder,
  query,
}: DataTableToolbarProps) {
  const [inputValue, setInputValue] = useState(query);
  const [isComposing, setIsComposing] = useState(false);
  const previousInputValue = useRef(inputValue);
  const previousQuery = useRef(query);
  const applySearchValue = useEffectEvent(
    (value: string, shouldCommit: boolean) => {
      onFilterChange(value);

      if (shouldCommit) {
        onQueryChange(value);
      }
    },
  );

  useEffect(() => {
    if (previousQuery.current === query) {
      return;
    }

    previousQuery.current = query;
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const inputChanged = previousInputValue.current !== inputValue;
    previousInputValue.current = inputValue;

    if (inputValue === query) {
      if (inputChanged) {
        applySearchValue(inputValue, false);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      applySearchValue(inputValue, !isComposing);
    }, searchUpdateDelay);

    return () => window.clearTimeout(timeout);
  }, [inputValue, isComposing, query]);

  return (
    <div className="flex items-center justify-between">
      <Input
        aria-label={label}
        className="w-full sm:max-w-sm"
        placeholder={placeholder}
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
        onCompositionEnd={(event) => {
          setInputValue(event.currentTarget.value);
          setIsComposing(false);
        }}
        onCompositionStart={() => setIsComposing(true)}
      />
    </div>
  );
});

interface DataPaginationProps {
  endRecord: number;
  onPageChange: (page: number) => void;
  page: number;
  startRecord: number;
  totalPages: number;
  totalRecords: number;
}

export function DataPagination({
  endRecord,
  onPageChange,
  page,
  startRecord,
  totalPages,
  totalRecords,
}: DataPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        {startRecord.toLocaleString("ko-KR")}–
        {endRecord.toLocaleString("ko-KR")} /{" "}
        {totalRecords.toLocaleString("ko-KR")}
      </p>
      <div className="flex items-center gap-2">
        <span className="mr-1 text-xs tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          aria-label="이전 페이지"
          disabled={page <= 1}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <Button
          aria-label="다음 페이지"
          disabled={page >= totalPages}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
