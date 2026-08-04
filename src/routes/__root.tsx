import { createRootRouteWithContext } from "@tanstack/react-router";

import type { RouterContext } from "@/app/router-context";
import { RootLayout } from "@/app/root-layout";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
