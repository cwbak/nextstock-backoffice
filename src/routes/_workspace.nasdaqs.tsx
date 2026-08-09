import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { nasdaqStocksQueryOptions } from "@/data-access/queries/nasdaq-stocks/queries";

export const Route = createFileRoute("/_workspace/nasdaqs")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(nasdaqStocksQueryOptions),
  pendingComponent: () => <ManagementPageLoading label="나스닥 정보" />,
});
