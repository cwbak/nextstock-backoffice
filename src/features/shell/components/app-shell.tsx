import type { ReactNode } from "react";

import { AppHeader } from "@/features/shell/components/app-header";
import { AppSidebar } from "@/features/shell/components/app-sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="grid min-h-svh grid-cols-1 bg-background text-foreground md:grid-cols-[17.5rem_minmax(0,1fr)]">
      <a
        className="fixed top-2 left-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0 motion-reduce:transition-none"
        href="#main-content"
      >
        본문으로 건너뛰기
      </a>
      <AppSidebar />
      <div className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)]">
        <AppHeader />
        <main
          className="min-h-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
          id="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
