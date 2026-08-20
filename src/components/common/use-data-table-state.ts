import { useCallback, useState } from "react";

export interface DataTableState {
  page: number;
  q: string;
}

export interface UnpaginatedDataTableState {
  q: string;
}

export type SortDirection = "asc" | "desc";

export interface SortableDataTableState<
  TSortField extends string,
> extends DataTableState {
  sortBy: TSortField | null;
  sortDirection: SortDirection;
}

export interface SortableUnpaginatedDataTableState<
  TSortField extends string,
> extends UnpaginatedDataTableState {
  sortBy: TSortField | null;
  sortDirection: SortDirection;
}

export function useUnpaginatedDataTableState<
  TState extends UnpaginatedDataTableState,
>(initialState: TState) {
  const [state, setState] = useState(initialState);

  const updateQuery = useCallback((q: string) => {
    setState((previous) => ({
      ...previous,
      q,
    }));
  }, []);

  return {
    setState,
    state,
    updateQuery,
  };
}

export function useDataTableState<TState extends DataTableState>(
  initialState: TState,
) {
  const [state, setState] = useState(initialState);

  const updateQuery = useCallback((query: string) => {
    setState((previous) => ({
      ...previous,
      page: 1,
      q: query,
    }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setState((previous) => ({
      ...previous,
      page,
    }));
  }, []);

  return {
    setState,
    state,
    updatePage,
    updateQuery,
  };
}
