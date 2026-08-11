import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";

export const Route = createFileRoute("/_workspace/listed-stocks")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(krStocksQueryOptions),
      context.queryClient.ensureQueryData(corporationsQueryOptions),
    ]),
  pendingComponent: () => <ManagementPageLoading label="상장 종목 목록" />,
});
