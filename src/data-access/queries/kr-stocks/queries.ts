import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { krStockListSchema } from "@/data-access/schemas/kr-stock";

export const krStocksQueryOptions = queryOptions({
  queryKey: krStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/kr-stocks", krStockListSchema, { signal }),
  staleTime: 30 * 1000,
});
