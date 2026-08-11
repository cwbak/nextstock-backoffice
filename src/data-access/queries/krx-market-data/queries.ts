import { infiniteQueryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krxMarketDataKeys } from "@/data-access/queries/krx-market-data/keys";
import {
  krxMarketDataListParamsSchema,
  krxMarketDataListSchema,
  type KrxMarketDataListParams,
} from "@/data-access/schemas/krx-market-data";
import { getPreviousLocalDate } from "@/features/krx-market-data/krx-market-data-date";

export const krxMarketDataPageLimit = 100;

function buildMarketDataPath(params: KrxMarketDataListParams) {
  const { stockCode, period, end, limit } =
    krxMarketDataListParamsSchema.parse(params);
  const searchParams = new URLSearchParams();

  searchParams.set("period", period);
  searchParams.set("end", end);
  searchParams.set("limit", String(limit));

  const query = searchParams.toString();

  return `/admin/krx-stocks/${encodeURIComponent(stockCode)}/market-data${query ? `?${query}` : ""}`;
}

export function getNextKrxMarketDataEnd(
  lastPage: ReadonlyArray<{ date: string }>,
  limit: number,
) {
  if (lastPage.length < limit) {
    return undefined;
  }

  const earliestDate = lastPage[0]?.date;

  return earliestDate ? getPreviousLocalDate(earliestDate) : undefined;
}

export function krxMarketDataInfiniteQueryOptions(
  params: KrxMarketDataListParams,
) {
  const parsedParams = krxMarketDataListParamsSchema.parse(params);

  return infiniteQueryOptions({
    queryKey: krxMarketDataKeys.list(params),
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        buildMarketDataPath({ ...parsedParams, end: pageParam }),
        krxMarketDataListSchema,
        { signal },
      ),
    initialPageParam: parsedParams.end,
    getNextPageParam: (lastPage) =>
      getNextKrxMarketDataEnd(lastPage, parsedParams.limit),
    staleTime: 30 * 1000,
  });
}
