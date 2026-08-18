import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { backgroundJobKeys } from "@/data-access/queries/background-jobs/keys";
import {
  backgroundJobListSchema,
  backgroundJobSchema,
} from "@/data-access/schemas/background-job";

const pollingIntervalMs = 2_000;

export function backgroundJobQueryOptions(jobId: number) {
  return queryOptions({
    queryKey: backgroundJobKeys.detail(jobId),
    queryFn: ({ signal }) =>
      apiRequest(`/admin/jobs/${jobId}`, backgroundJobSchema, { signal }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status === "COMPLETED" || status === "FAILED"
        ? false
        : pollingIntervalMs;
    },
  });
}

export function backgroundJobsQueryOptions(limit = 50) {
  return queryOptions({
    queryKey: backgroundJobKeys.list(limit),
    queryFn: ({ signal }) =>
      apiRequest(`/admin/jobs?limit=${limit}`, backgroundJobListSchema, {
        signal,
      }),
    staleTime: pollingIntervalMs,
  });
}
