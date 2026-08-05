import { Activity, Suspense } from "react";

import { Outlet, useRouterState } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import { CorporationInvestmentsPage } from "@/features/corporation-investments";
import { CorporationsPage } from "@/features/corporations";
import { ListedStocksPage } from "@/features/listed-stocks";
import { NasdaqInfoPage } from "@/features/nasdaq-info";
import { isNavigationPath } from "@/features/shell/navigation-items";

export function LnbWorkspace() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activePath = isNavigationPath(pathname) ? pathname : null;

  if (!activePath) {
    return <Outlet />;
  }

  return (
    <>
      <Activity
        mode={activePath === "/nasdaqs" ? "visible" : "hidden"}
        name="NASDAQ info workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="나스닥 정보" />}>
          <NasdaqInfoPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/corporations" ? "visible" : "hidden"}
        name="Corporations workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="법인 목록" />}>
          <CorporationsPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/corporation-investments" ? "visible" : "hidden"}
        name="Corporation investments workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="법인 출자현황" />}>
          <CorporationInvestmentsPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/listed-stocks" ? "visible" : "hidden"}
        name="Listed stocks workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="상장 종목 목록" />}>
          <ListedStocksPage />
        </Suspense>
      </Activity>
      <Outlet />
    </>
  );
}
