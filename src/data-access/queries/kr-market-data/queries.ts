import { infiniteQueryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import {
  krMarketDataListParamsSchema,
  krMarketDataListSchema,
  type KrMarketDataListParams,
} from "@/data-access/schemas/kr-market-data";
import { getPreviousLocalDate } from "@/features/kr-market-data/kr-market-data-date";

export const krMarketDataPageLimit = 100;

function buildMarketDataPath(params: KrMarketDataListParams) {
  const { stockCode, period, end, limit } =
    krMarketDataListParamsSchema.parse(params);
  const searchParams = new URLSearchParams();

  searchParams.set("period", period);
  searchParams.set("end", end);
  searchParams.set("limit", String(limit));

  const query = searchParams.toString();

  return `/admin/kr-stocks/${encodeURIComponent(stockCode)}/market-data${query ? `?${query}` : ""}`;
}

export function getNextKrMarketDataEnd(
  lastPage: ReadonlyArray<{ date: string }>,
  limit: number,
) {
  if (lastPage.length < limit) {
    return undefined;
  }

  const earliestDate = lastPage[0]?.date;

  return earliestDate ? getPreviousLocalDate(earliestDate) : undefined;
}

export function krMarketDataInfiniteQueryOptions(
  params: KrMarketDataListParams,
) {
  const parsedParams = krMarketDataListParamsSchema.parse(params);

  return infiniteQueryOptions({
    queryKey: krMarketDataKeys.list(params),
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        buildMarketDataPath({ ...parsedParams, end: pageParam }),
        krMarketDataListSchema,
        { signal },
      ),
    initialPageParam: parsedParams.end,
    getNextPageParam: (lastPage) =>
      getNextKrMarketDataEnd(lastPage, parsedParams.limit),
    staleTime: 30 * 1000,
  });
}
