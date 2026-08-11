import type { KrxMarketDataPeriod } from "@/data-access/schemas/krx-market-data";

export const krxMarketDataPeriodOptions = [
  { label: "일봉", value: "daily" },
  { label: "주봉", value: "weekly" },
  { label: "월봉", value: "monthly" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: KrxMarketDataPeriod;
}>;

const krxMarketDataPeriodLabels: Record<KrxMarketDataPeriod, string> = {
  daily: "일봉",
  weekly: "주봉",
  monthly: "월봉",
};

export function isKrxMarketDataPeriod(
  value: string,
): value is KrxMarketDataPeriod {
  return value === "daily" || value === "weekly" || value === "monthly";
}

export function getKrxMarketDataPeriodLabel(period: KrxMarketDataPeriod) {
  return krxMarketDataPeriodLabels[period];
}
