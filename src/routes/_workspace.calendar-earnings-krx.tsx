import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { krxCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

export const Route = createFileRoute("/_workspace/calendar-earnings-krx")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(krxCalendarEarningsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="KRX 실적 일정" />,
});
