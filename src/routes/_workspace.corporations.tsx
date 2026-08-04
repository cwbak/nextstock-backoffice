import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";

export const Route = createFileRoute("/_workspace/corporations")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(corporationsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="법인 목록" />,
});
