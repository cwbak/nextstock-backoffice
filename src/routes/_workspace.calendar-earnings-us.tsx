import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { usCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

export const Route = createFileRoute("/_workspace/calendar-earnings-us")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usCalendarEarningsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="US 실적 일정" />,
});
