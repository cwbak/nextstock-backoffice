import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { themeKeys } from "@/data-access/queries/themes/keys";
import { krxStockListSchema } from "@/data-access/schemas/krx-stock";
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
        krxStockListSchema,
        { signal },
      ),
    staleTime: 30 * 1000,
  });
}
