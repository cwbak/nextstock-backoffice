import { createFileRoute } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { equityInvestmentsQueryOptions } from "@/data-access/queries/equity-investments/queries";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";

export const Route = createFileRoute("/_workspace/corporation-investments")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(equityInvestmentsQueryOptions),
      context.queryClient.ensureQueryData(corporationsQueryOptions),
    ]),
  pendingComponent: () => <ManagementPageLoading label="지분투자" />,
});
