import { Activity, Suspense } from "react";

import { Outlet, useRouterState } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import {
  UsCalendarEarningsPage,
  KrCalendarEarningsPage,
} from "@/features/calendar-earnings";
import { CalendarEventsPage } from "@/features/calendar-events";
import { CorporationInvestmentsPage } from "@/features/corporation-investments";
import { CorporationsPage } from "@/features/corporations";
import { KrStocksPage } from "@/features/kr-stocks";
import { KrMarketDataPage } from "@/features/kr-market-data";
import { UsStocksPage } from "@/features/us-stocks";
import { ThemesPage } from "@/features/themes";
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
        mode={activePath === "/us-stocks" ? "visible" : "hidden"}
        name="US stocks workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="US 종목 정보" />}>
          <UsStocksPage />
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
        name="KR stocks workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="상장 종목 목록" />}>
          <KrStocksPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/kr-market-data" ? "visible" : "hidden"}
        name="KR candle market data workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="KR 캔들" />}>
          <KrMarketDataPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/themes" ? "visible" : "hidden"}
        name="Theme listing workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="테마 리스팅" />}>
          <ThemesPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/calendar-events" ? "visible" : "hidden"}
        name="Calendar events workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="일정" />}>
          <CalendarEventsPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/calendar-earnings-us" ? "visible" : "hidden"}
        name="US calendar earnings workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="US 실적 일정" />}>
          <UsCalendarEarningsPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/calendar-earnings-kr" ? "visible" : "hidden"}
        name="KR calendar earnings workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="KR 실적 일정" />}>
          <KrCalendarEarningsPage />
        </Suspense>
      </Activity>
      <Outlet />
    </>
  );
}
