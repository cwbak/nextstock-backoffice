import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { sectorsQueryOptions } from "@/data-access/queries/sectors/queries";

export const Route = createFileRoute("/_workspace/sectors")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(sectorsQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="섹터 관리" />,
});
