import { Outlet } from "@tanstack/react-router";

import { AppShell } from "@/features/shell";

export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
