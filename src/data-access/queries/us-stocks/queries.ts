import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { usStockKeys } from "@/data-access/queries/us-stocks/keys";
import { usStockListSchema } from "@/data-access/schemas/us-stock";

export const usStocksQueryOptions = queryOptions({
  queryKey: usStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/us-stocks", usStockListSchema, { signal }),
  staleTime: 30 * 1000,
});
