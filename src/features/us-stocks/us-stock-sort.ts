import type { SortDirection } from "@/components/common/use-data-table-state";
import type { UsStock } from "@/data-access/schemas/us-stock";
import { marketCapAsCents } from "@/lib/market-cap";

export function sortUsStocksByMarketCap(
  items: ReadonlyArray<UsStock>,
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
