import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import {
  krStockListSchema,
  krStockNameAliasesSchema,
} from "@/data-access/schemas/kr-stock";

export const krStocksQueryOptions = queryOptions({
  queryKey: krStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/kr-stocks", krStockListSchema, { signal }),
  staleTime: 30 * 1000,
});

export function krStockNameAliasesQueryOptions(code: string) {
  return queryOptions({
    queryKey: krStockKeys.nameAliases(code),
    queryFn: ({ signal }) =>
      apiRequest(
        `/admin/kr-stocks/${encodeURIComponent(code)}/name-aliases`,
        krStockNameAliasesSchema,
        { signal },
      ),
    refetchOnMount: "always",
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
}
