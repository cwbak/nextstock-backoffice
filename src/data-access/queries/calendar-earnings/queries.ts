import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { calendarEarningKeys } from "@/data-access/queries/calendar-earnings/keys";
import { calendarEarningListSchema } from "@/data-access/schemas/calendar-earning";

export const calendarEarningsQueryOptions = queryOptions({
  queryKey: calendarEarningKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/calendar-earnings", calendarEarningListSchema, {
      signal,
    }),
  staleTime: 30 * 1000,
});
