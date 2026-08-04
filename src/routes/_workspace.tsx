import { createFileRoute } from "@tanstack/react-router";

import { LnbWorkspace } from "@/features/shell";

export const Route = createFileRoute("/_workspace")({
  component: LnbWorkspace,
});
