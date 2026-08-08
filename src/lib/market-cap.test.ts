import { describe, expect, it } from "vitest";

import { filterByMarketCap } from "@/lib/market-cap";

interface Item {
  marketCap: string | null;
  symbol: string;
}

const items: ReadonlyArray<Item> = [
  { symbol: "OVER_200B", marketCap: "200000000000.01" },
  { symbol: "AT_200B", marketCap: "200000000000.00" },
  { symbol: "AT_10B", marketCap: "10000000000.00" },
  { symbol: "AT_2B", marketCap: "2000000000.00" },
  { symbol: "AT_300M", marketCap: "300000000.00" },
  { symbol: "UNDER_300M", marketCap: "299999999.99" },
  { symbol: "UNKNOWN", marketCap: null },
];

describe("filterByMarketCap", () => {
  it.each([
    ["200b", ["OVER_200B", "AT_200B"]],
    ["10b", ["OVER_200B", "AT_200B", "AT_10B"]],
    ["2b", ["OVER_200B", "AT_200B", "AT_10B", "AT_2B"]],
    ["300m", ["OVER_200B", "AT_200B", "AT_10B", "AT_2B", "AT_300M"]],
  ] as const)("%s 하한 이상인 항목만 반환한다", (filter, symbols) => {
    expect(filterByMarketCap(items, filter).map((item) => item.symbol)).toEqual(
      symbols,
    );
  });

  it("전체 필터에서는 시가총액이 없는 항목도 포함한다", () => {
    expect(filterByMarketCap(items, "all")).toEqual(items);
  });
});
