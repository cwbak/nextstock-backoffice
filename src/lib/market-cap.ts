export const marketCapFilterOptions = [
  { label: "전체", value: "all" },
  { label: "$200B 이상", value: "200b" },
  { label: "$10B 이상", value: "10b" },
  { label: "$2B 이상", value: "2b" },
  { label: "$300M 이상", value: "300m" },
] as const;

export type MarketCapFilter = (typeof marketCapFilterOptions)[number]["value"];

const minimumMarketCapDollars: Record<
  Exclude<MarketCapFilter, "all">,
  bigint
> = {
  "200b": 200_000_000_000n,
  "10b": 10_000_000_000n,
  "2b": 2_000_000_000n,
  "300m": 300_000_000n,
};

export function marketCapAsCents(value: string) {
  const [integer = "0", fraction = ""] = value.split(".");

  return BigInt(integer) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function filterByMarketCap<TItem extends { marketCap: string | null }>(
  items: ReadonlyArray<TItem>,
  filter: MarketCapFilter,
) {
  if (filter === "all") {
    return items;
  }

  const minimumCents = minimumMarketCapDollars[filter] * 100n;

  return items.filter(
    (item) =>
      item.marketCap !== null &&
      marketCapAsCents(item.marketCap) >= minimumCents,
  );
}

export function isMarketCapFilter(value: string): value is MarketCapFilter {
  return marketCapFilterOptions.some((option) => option.value === value);
}

export function getMarketCapFilterLabel(filter: MarketCapFilter) {
  return (
    marketCapFilterOptions.find((option) => option.value === filter)?.label ??
    ""
  );
}
