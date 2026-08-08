export const sp500FilterOptions = [
  { label: "S&P 500 전체", value: "all" },
  { label: "S&P 500 편입", value: "included" },
  { label: "S&P 500 미편입", value: "excluded" },
] as const;

export type Sp500Filter = (typeof sp500FilterOptions)[number]["value"];

export function filterBySp500<TItem extends { isSp500: boolean }>(
  items: ReadonlyArray<TItem>,
  filter: Sp500Filter,
) {
  if (filter === "all") {
    return items;
  }

  const isSp500 = filter === "included";

  return items.filter((item) => item.isSp500 === isSp500);
}

export function isSp500Filter(value: string): value is Sp500Filter {
  return sp500FilterOptions.some((option) => option.value === value);
}

export function getSp500FilterLabel(filter: Sp500Filter) {
  return (
    sp500FilterOptions.find((option) => option.value === filter)?.label ?? ""
  );
}
