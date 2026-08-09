import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krxStockKeys } from "@/data-access/queries/krx-stocks/keys";
import { krxStockListSchema } from "@/data-access/schemas/krx-stock";

export const krxStocksQueryOptions = queryOptions({
  queryKey: krxStockKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/krx-stocks", krxStockListSchema, { signal }),
  staleTime: 30 * 1000,
});
