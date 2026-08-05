import type { SortDirection } from "@/components/common/use-data-table-state";
import type { NasdaqInfo } from "@/data-access/schemas/nasdaq-info";

function marketCapAsCents(value: string) {
  const [integer = "0", fraction = ""] = value.split(".");

  return BigInt(integer) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function sortNasdaqInfoByMarketCap(
  items: ReadonlyArray<NasdaqInfo>,
  direction: SortDirection,
) {
  return [...items].sort((first, second) => {
    if (first.marketCap === null && second.marketCap === null) {
      return first.symbol.localeCompare(second.symbol);
    }
    if (first.marketCap === null) {
      return 1;
    }
    if (second.marketCap === null) {
      return -1;
    }

    const firstMarketCap = marketCapAsCents(first.marketCap);
    const secondMarketCap = marketCapAsCents(second.marketCap);
    if (firstMarketCap === secondMarketCap) {
      return first.symbol.localeCompare(second.symbol);
    }

    const comparison = firstMarketCap < secondMarketCap ? -1 : 1;
    return direction === "asc" ? comparison : -comparison;
  });
}
