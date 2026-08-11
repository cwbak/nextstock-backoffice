import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krxMarketDataKeys } from "@/data-access/queries/krx-market-data/keys";
import {
  krxMarketDataListParamsSchema,
  krxMarketDataListSchema,
  type KrxMarketDataListParams,
} from "@/data-access/schemas/krx-market-data";

function buildMarketDataPath(params: KrxMarketDataListParams) {
  const { stockCode, from, to } = krxMarketDataListParamsSchema.parse(params);
  const searchParams = new URLSearchParams();

  if (from) {
    searchParams.set("from", from);
  }
  if (to) {
    searchParams.set("to", to);
  }

  const query = searchParams.toString();

  return `/admin/krx-stocks/${encodeURIComponent(stockCode)}/market-data${query ? `?${query}` : ""}`;
}

export function krxMarketDataQueryOptions(params: KrxMarketDataListParams) {
  return queryOptions({
    queryKey: krxMarketDataKeys.list(params),
    queryFn: ({ signal }) =>
      apiRequest(buildMarketDataPath(params), krxMarketDataListSchema, {
        signal,
      }),
    staleTime: 30 * 1000,
  });
}
