import type { SortDirection } from "@/components/common/use-data-table-state";
import type { UsStock } from "@/data-access/schemas/us-stock";
import { marketCapAsCents } from "@/lib/market-cap";

export function sortUsStocksByMarketCap(
  items: ReadonlyArray<UsStock>,
  direction: SortDirection,
) {
  return items
    .map((item) => ({
      item,
      marketCap:
        item.marketCap === null ? null : marketCapAsCents(item.marketCap),
    }))
    .sort((first, second) => {
      if (first.marketCap === null && second.marketCap === null) {
        return first.item.symbol.localeCompare(second.item.symbol);
      }
      if (first.marketCap === null) {
        return 1;
      }
      if (second.marketCap === null) {
        return -1;
      }

      if (first.marketCap === second.marketCap) {
        return first.item.symbol.localeCompare(second.item.symbol);
      }

      const comparison = first.marketCap < second.marketCap ? -1 : 1;
      return direction === "asc" ? comparison : -comparison;
    })
    .map(({ item }) => item);
}
