import { Activity, Suspense } from "react";

import { Outlet, useRouterState } from "@tanstack/react-router";

import { ManagementPageLoading } from "@/components/common/management-page-loading";
import {
  CalendarEarningsPage,
  KrxCalendarEarningsPage,
} from "@/features/calendar-earnings";
import { CalendarEventsPage } from "@/features/calendar-events";
import { CorporationInvestmentsPage } from "@/features/corporation-investments";
import { CorporationsPage } from "@/features/corporations";
import { KrxStocksPage } from "@/features/krx-stocks";
import { KrxMarketDataPage } from "@/features/krx-market-data";
import { NasdaqStocksPage } from "@/features/nasdaq-stocks";
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
        mode={activePath === "/nasdaqs" ? "visible" : "hidden"}
        name="NASDAQ stocks workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="나스닥 정보" />}>
          <NasdaqStocksPage />
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
        name="KRX stocks workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="상장 종목 목록" />}>
          <KrxStocksPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/krx-market-data" ? "visible" : "hidden"}
        name="KRX candle market data workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="KRX 캔들" />}>
          <KrxMarketDataPage />
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
        mode={activePath === "/calendar-earnings" ? "visible" : "hidden"}
        name="NASDAQ calendar earnings workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="NASDAQ 실적 일정" />}>
          <CalendarEarningsPage />
        </Suspense>
      </Activity>
      <Activity
        mode={activePath === "/calendar-earnings-krx" ? "visible" : "hidden"}
        name="KRX calendar earnings workspace"
      >
        <Suspense fallback={<ManagementPageLoading label="KRX 실적 일정" />}>
          <KrxCalendarEarningsPage />
        </Suspense>
      </Activity>
      <Outlet />
    </>
  );
}
