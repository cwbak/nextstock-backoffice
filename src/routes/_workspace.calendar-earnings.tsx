import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { calendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

export const Route = createFileRoute("/_workspace/calendar-earnings")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(calendarEarningsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="NASDAQ 실적 일정" />,
});
