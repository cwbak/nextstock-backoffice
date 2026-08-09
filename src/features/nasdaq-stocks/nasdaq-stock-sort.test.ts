import { describe, expect, it } from "vitest";

import type { NasdaqStock } from "@/data-access/schemas/nasdaq-stock";
import { sortNasdaqStocksByMarketCap } from "@/features/nasdaq-stocks/nasdaq-stock-sort";

function createItem(symbol: string, marketCap: string | null): NasdaqStock {
  return {
    symbol,
    name: symbol,
    marketCap,
    country: null,
    ipoYear: null,
    sector: null,
    industry: null,
    isSp500: false,
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
  };
}

const items = [
  createItem("B", "9007199254740993.02"),
  createItem("A", "9007199254740993.01"),
  createItem("C", null),
];

describe("sortNasdaqStocksByMarketCap", () => {
  it("큰 시가총액의 정밀도를 유지해 오름차순 정렬한다", () => {
    expect(
      sortNasdaqStocksByMarketCap(items, "asc").map((item) => item.symbol),
    ).toEqual(["A", "B", "C"]);
  });

  it("내림차순에서도 null 시가총액을 마지막에 둔다", () => {
    expect(
      sortNasdaqStocksByMarketCap(items, "desc").map((item) => item.symbol),
    ).toEqual(["B", "A", "C"]);
  });
});
