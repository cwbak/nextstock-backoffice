import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/data-access/api/client";
import { calendarEventKeys } from "@/data-access/queries/calendar-events/keys";
import { calendarEventListSchema } from "@/data-access/schemas/calendar-event";

export const calendarEventsQueryOptions = queryOptions({
  queryKey: calendarEventKeys.list(),
  queryFn: ({ signal }) =>
    apiRequest("/admin/calendar-events", calendarEventListSchema, { signal }),
  staleTime: 30 * 1000,
});
