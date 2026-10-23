import { describe, expect, it } from "vitest";

import type { UsStock } from "@/data-access/schemas/us-stock";
import { sortUsStocksByMarketCap } from "@/features/us-stocks/us-stock-sort";

function createItem(symbol: string, marketCap: string | null): UsStock {
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

describe("sortUsStocksByMarketCap", () => {
  it("큰 시가총액의 정밀도를 유지해 오름차순 정렬한다", () => {
    expect(
      sortUsStocksByMarketCap(items, "asc").map((item) => item.symbol),
    ).toEqual(["A", "B", "C"]);
  });

  it("내림차순에서도 null 시가총액을 마지막에 둔다", () => {
    expect(
      sortUsStocksByMarketCap(items, "desc").map((item) => item.symbol),
    ).toEqual(["B", "A", "C"]);
  });

  it.each(["asc", "desc"] as const)(
    "%s 정렬에서 같은 시가총액과 누락된 시가총액은 심볼 순서를 유지한다",
    (direction) => {
      const tiedItems = [
        createItem("D", null),
        createItem("B", "100.00"),
        createItem("C", null),
        createItem("A", "100"),
      ];

      expect(
        sortUsStocksByMarketCap(tiedItems, direction).map(
          (item) => item.symbol,
        ),
      ).toEqual(["A", "B", "C", "D"]);
    },
  );

  it("원본 배열과 종목 객체를 변경하지 않는다", () => {
    const input = Object.freeze([
      Object.freeze(createItem("B", "200")),
      Object.freeze(createItem("A", "100")),
    ]);
    const sorted = sortUsStocksByMarketCap(input, "asc");

    expect(input.map((item) => item.symbol)).toEqual(["B", "A"]);
    expect(sorted[0]).toBe(input[1]);
    expect(sorted[1]).toBe(input[0]);
  });
});
