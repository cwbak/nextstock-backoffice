import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { listedStocksQueryOptions } from "@/data-access/queries/listed-stocks/queries";

export const Route = createFileRoute("/_workspace/listed-stocks")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(listedStocksQueryOptions),
      context.queryClient.ensureQueryData(corporationsQueryOptions),
    ]),
  pendingComponent: () => <ManagementPageLoading label="상장 종목 목록" />,
});
