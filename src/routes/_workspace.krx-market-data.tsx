import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { krxStocksQueryOptions } from "@/data-access/queries/krx-stocks/queries";

export const Route = createFileRoute("/_workspace/krx-market-data")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(krxStocksQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="KRX 일봉" />,
});
