import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";

export const Route = createFileRoute("/_workspace/kr-market-data")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(krStocksQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="KR 캔들" />,
});
