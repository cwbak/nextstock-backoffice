import { createRouter } from "@tanstack/react-router";

import { queryClient } from "@/app/query-client";
import { RouteError } from "@/components/common/route-error";
import { RouteNotFound } from "@/components/common/route-not-found";
import { routeTree } from "@/routeTree.gen";

export const router = createRouter({
  context: {
    queryClient,
  },
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
