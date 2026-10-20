import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import {
  sectorIdSchema,
  sectorListSchema,
  sectorSchema,
} from "@/data-access/schemas/sector";

export const sectorsQueryOptions = queryOptions({
  queryKey: sectorKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/sectors", sectorListSchema, { signal }),
  staleTime: 30 * 1000,
});

export function sectorQueryOptions(id: number) {
  return queryOptions({
    queryKey: sectorKeys.detail(id),
    queryFn: ({ signal }) =>
      apiRequest(`/admin/sectors/${sectorIdSchema.parse(id)}`, sectorSchema, {
        signal,
      }),
    staleTime: 30 * 1000,
  });
}
