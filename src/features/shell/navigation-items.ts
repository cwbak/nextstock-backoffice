import {
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ChartCandlestickIcon,
  Globe2Icon,
  NetworkIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavigationPath =
  | "/us-stocks"
  | "/corporations"
  | "/corporation-investments"
  | "/listed-stocks"
  | "/kr-market-data"
  | "/themes"
  | "/calendar-events"
  | "/calendar-earnings-us"
  | "/calendar-earnings-kr";

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  to: NavigationPath;
}

export const navigationItems = [
  {
    icon: Globe2Icon,
    label: "US 종목 정보",
    to: "/us-stocks",
  },
  {
    icon: Building2Icon,
    label: "법인",
    to: "/corporations",
  },
  {
    icon: NetworkIcon,
    label: "출자현황",
    to: "/corporation-investments",
  },
  {
    icon: ChartCandlestickIcon,
    label: "주식",
    to: "/listed-stocks",
  },
  {
    icon: ChartCandlestickIcon,
    label: "KR 캔들",
    to: "/kr-market-data",
  },
  {
    icon: TagsIcon,
    label: "테마 리스팅",
    to: "/themes",
  },
  {
    icon: CalendarDaysIcon,
    label: "일정",
    to: "/calendar-events",
  },
  {
    icon: CalendarClockIcon,
    label: "실적(US)",
    to: "/calendar-earnings-us",
  },
  {
    icon: CalendarClockIcon,
    label: "실적(KR)",
    to: "/calendar-earnings-kr",
  },
] as const satisfies ReadonlyArray<NavigationItem>;

export function isNavigationPath(pathname: string): pathname is NavigationPath {
  return navigationItems.some((item) => item.to === pathname);
}
