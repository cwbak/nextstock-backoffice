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
  | "/nasdaqs"
  | "/corporations"
  | "/corporation-investments"
  | "/listed-stocks"
  | "/krx-market-data"
  | "/themes"
  | "/calendar-events"
  | "/calendar-earnings"
  | "/calendar-earnings-krx";

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  to: NavigationPath;
}

export const navigationItems = [
  {
    icon: Globe2Icon,
    label: "나스닥 정보",
    to: "/nasdaqs",
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
    label: "KRX 캔들",
    to: "/krx-market-data",
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
    label: "실적(NASDAQ)",
    to: "/calendar-earnings",
  },
  {
    icon: CalendarClockIcon,
    label: "실적(KRX)",
    to: "/calendar-earnings-krx",
  },
] as const satisfies ReadonlyArray<NavigationItem>;

export function isNavigationPath(pathname: string): pathname is NavigationPath {
  return navigationItems.some((item) => item.to === pathname);
}
