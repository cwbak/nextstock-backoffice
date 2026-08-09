import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { themesQueryOptions } from "@/data-access/queries/themes/queries";

export const Route = createFileRoute("/_workspace/themes")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(themesQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="테마 리스팅" />,
});
