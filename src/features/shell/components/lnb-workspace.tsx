import { lazy } from "react";

import { Outlet, useRouterState } from "@tanstack/react-router";

import { RetainedWorkspace } from "@/features/shell/components/retained-workspace";
import { isNavigationPath } from "@/features/shell/navigation-items";

const UsStocksPage = lazy(() =>
  import("@/features/us-stocks").then((module) => ({
    default: module.UsStocksPage,
  })),
);
const CorporationsPage = lazy(() =>
  import("@/features/corporations").then((module) => ({
    default: module.CorporationsPage,
  })),
);
const CorporationInvestmentsPage = lazy(() =>
  import("@/features/corporation-investments").then((module) => ({
    default: module.CorporationInvestmentsPage,
  })),
);
const KrStocksPage = lazy(() =>
  import("@/features/kr-stocks").then((module) => ({
    default: module.KrStocksPage,
  })),
);
const KrMarketDataPage = lazy(() =>
  import("@/features/kr-market-data").then((module) => ({
    default: module.KrMarketDataPage,
  })),
);
const ThemesPage = lazy(() =>
  import("@/features/themes").then((module) => ({
    default: module.ThemesPage,
  })),
);
const SectorsPage = lazy(() =>
  import("@/features/sectors").then((module) => ({
    default: module.SectorsPage,
  })),
);
const CalendarEventsPage = lazy(() =>
  import("@/features/calendar-events").then((module) => ({
    default: module.CalendarEventsPage,
  })),
);
const UsCalendarEarningsPage = lazy(() =>
  import("@/features/calendar-earnings").then((module) => ({
    default: module.UsCalendarEarningsPage,
  })),
);
const KrCalendarEarningsPage = lazy(() =>
  import("@/features/calendar-earnings").then((module) => ({
    default: module.KrCalendarEarningsPage,
  })),
);

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
      <RetainedWorkspace
        active={activePath === "/us-stocks"}
        label="US 종목 정보"
        name="US stocks workspace"
      >
        <UsStocksPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/corporations"}
        label="법인 목록"
        name="Corporations workspace"
      >
        <CorporationsPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/corporation-investments"}
        label="법인 출자현황"
        name="Corporation investments workspace"
      >
        <CorporationInvestmentsPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/listed-stocks"}
        label="상장 종목 목록"
        name="KR stocks workspace"
      >
        <KrStocksPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/kr-market-data"}
        label="KR 캔들"
        name="KR candle market data workspace"
      >
        <KrMarketDataPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/themes"}
        label="테마 리스팅"
        name="Theme listing workspace"
      >
        <ThemesPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/sectors"}
        label="섹터 관리"
        name="Sectors workspace"
      >
        <SectorsPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/calendar-events"}
        label="일정"
        name="Calendar events workspace"
      >
        <CalendarEventsPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/calendar-earnings-us"}
        label="US 실적 일정"
        name="US calendar earnings workspace"
      >
        <UsCalendarEarningsPage />
      </RetainedWorkspace>
      <RetainedWorkspace
        active={activePath === "/calendar-earnings-kr"}
        label="KR 실적 일정"
        name="KR calendar earnings workspace"
      >
        <KrCalendarEarningsPage />
      </RetainedWorkspace>
      <Outlet />
    </>
  );
}
