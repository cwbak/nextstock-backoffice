import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { listedStockKeys } from "@/data-access/queries/listed-stocks/keys";
import { listedStockListSchema } from "@/data-access/schemas/listed-stock";

export const listedStocksQueryOptions = queryOptions({
  queryKey: listedStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/listed-stocks", listedStockListSchema, { signal }),
  staleTime: 30 * 1000,
});
