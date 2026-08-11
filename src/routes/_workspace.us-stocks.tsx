import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { usStocksQueryOptions } from "@/data-access/queries/us-stocks/queries";

export const Route = createFileRoute("/_workspace/us-stocks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usStocksQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="US 종목 정보" />,
});
