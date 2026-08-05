import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { calendarEventsQueryOptions } from "@/data-access/queries/calendar-events/queries";

export const Route = createFileRoute("/_workspace/calendar-events")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(calendarEventsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="일정" />,
});
