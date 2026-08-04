import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { corporationIndustrySchema } from "@/data-access/schemas/corporation-industry";
import { corporationListSchema } from "@/data-access/schemas/corporation";

export const corporationsQueryOptions = queryOptions({
  queryKey: corporationKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/corporations", corporationListSchema, { signal }),
  staleTime: 30 * 1000,
});

export function corporationIndustryQueryOptions(code: string) {
  return queryOptions({
    queryKey: corporationKeys.industry(code),
    queryFn: ({ signal }) =>
      apiRequest(
        `/admin/corporations/${encodeURIComponent(code)}/industry`,
        corporationIndustrySchema,
        { signal },
      ),
    staleTime: 5 * 60 * 1000,
  });
}
