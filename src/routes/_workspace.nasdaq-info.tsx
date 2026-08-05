import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { nasdaqInfoQueryOptions } from "@/data-access/queries/nasdaq-info/queries";

export const Route = createFileRoute("/_workspace/nasdaq-info")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(nasdaqInfoQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="나스닥 정보" />,
});
