import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { krCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

export const Route = createFileRoute("/_workspace/calendar-earnings-kr")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(krCalendarEarningsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="KR 실적 일정" />,
});
