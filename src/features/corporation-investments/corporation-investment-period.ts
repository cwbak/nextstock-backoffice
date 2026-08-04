import type { EquityInvestmentPeriod } from "@/data-access/schemas/equity-investment";

export function getDefaultCorporationInvestmentPeriod(): EquityInvestmentPeriod {
  return {
    bsnsYear: String(new Date().getFullYear() - 1),
    reprtCode: 4,
  };
}
