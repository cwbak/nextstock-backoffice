import type { KrMarketDataPeriod } from "@/data-access/schemas/kr-market-data";

export const krMarketDataPeriodOptions = [
  { label: "일봉", value: "daily" },
  { label: "주봉", value: "weekly" },
  { label: "월봉", value: "monthly" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: KrMarketDataPeriod;
}>;

const krMarketDataPeriodLabels: Record<KrMarketDataPeriod, string> = {
  daily: "일봉",
  weekly: "주봉",
  monthly: "월봉",
};

export function isKrMarketDataPeriod(
  value: string,
): value is KrMarketDataPeriod {
  return value === "daily" || value === "weekly" || value === "monthly";
}

export function getKrMarketDataPeriodLabel(period: KrMarketDataPeriod) {
  return krMarketDataPeriodLabels[period];
}
