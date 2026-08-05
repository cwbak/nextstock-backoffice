import {
  Building2Icon,
  ChartCandlestickIcon,
  Globe2Icon,
  NetworkIcon,
  type LucideIcon,
} from "lucide-react";

export type NavigationPath =
  | "/nasdaq-info"
  | "/corporations"
  | "/corporation-investments"
  | "/listed-stocks";

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  to: NavigationPath;
}

export const navigationItems = [
  {
    icon: Globe2Icon,
    label: "나스닥 정보",
    to: "/nasdaq-info",
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
] as const satisfies ReadonlyArray<NavigationItem>;

export function isNavigationPath(pathname: string): pathname is NavigationPath {
  return navigationItems.some((item) => item.to === pathname);
}
