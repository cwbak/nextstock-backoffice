import { useCallback, useState } from "react";

export interface DataTableState {
  page: number;
  q: string;
}

export type SortDirection = "asc" | "desc";

export interface SortableDataTableState<
  TSortField extends string,
> extends DataTableState {
  sortBy: TSortField | null;
  sortDirection: SortDirection;
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
