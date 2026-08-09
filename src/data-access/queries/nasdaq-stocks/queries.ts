import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { nasdaqStockKeys } from "@/data-access/queries/nasdaq-stocks/keys";
import { nasdaqStockListSchema } from "@/data-access/schemas/nasdaq-stock";

export const nasdaqStocksQueryOptions = queryOptions({
  queryKey: nasdaqStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/nasdaq-stocks", nasdaqStockListSchema, { signal }),
  staleTime: 30 * 1000,
});
