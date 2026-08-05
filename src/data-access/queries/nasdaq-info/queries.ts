import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { nasdaqInfoKeys } from "@/data-access/queries/nasdaq-info/keys";
import { nasdaqInfoListSchema } from "@/data-access/schemas/nasdaq-info";

export const nasdaqInfoQueryOptions = queryOptions({
  queryKey: nasdaqInfoKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/nasdaqs", nasdaqInfoListSchema, { signal }),
  staleTime: 30 * 1000,
});
