import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { themeKeys } from "@/data-access/queries/themes/keys";
import { krStockListSchema } from "@/data-access/schemas/kr-stock";
import { themeListSchema } from "@/data-access/schemas/theme";

export const themesQueryOptions = queryOptions({
  queryKey: themeKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/themes", themeListSchema, { signal }),
  staleTime: 30 * 1000,
});

export function themeStocksQueryOptions(themeId: number) {
  return queryOptions({
    queryKey: themeKeys.stocks(themeId),
    queryFn: ({ signal }) =>
      apiRequest(
        `/admin/themes/${encodeURIComponent(themeId)}/stocks`,
        krStockListSchema,
        { signal },
      ),
    staleTime: 30 * 1000,
  });
}
