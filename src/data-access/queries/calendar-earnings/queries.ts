import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { calendarEarningKeys } from "@/data-access/queries/calendar-earnings/keys";
import { usCalendarEarningListSchema } from "@/data-access/schemas/us-calendar-earning";
import { krCalendarEarningListSchema } from "@/data-access/schemas/kr-calendar-earning";

export const usCalendarEarningsQueryOptions = queryOptions({
  queryKey: calendarEarningKeys.us(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/calendar-earnings/us", usCalendarEarningListSchema, {
      signal,
    }),
  staleTime: 30 * 1000,
});

export const krCalendarEarningsQueryOptions = queryOptions({
  queryKey: calendarEarningKeys.kr(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/calendar-earnings/kr", krCalendarEarningListSchema, {
      signal,
    }),
  staleTime: 30 * 1000,
});
