import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { equityInvestmentKeys } from "@/data-access/queries/equity-investments/keys";
import { equityInvestmentListSchema } from "@/data-access/schemas/equity-investment";

export const equityInvestmentsQueryOptions = queryOptions({
  queryKey: equityInvestmentKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/equity_investments", equityInvestmentListSchema, {
      signal,
    }),
  staleTime: 30 * 1000,
});
