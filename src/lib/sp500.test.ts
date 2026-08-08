import { describe, expect, it } from "vitest";

import { filterBySp500 } from "@/lib/sp500";

const items = [
  { symbol: "A", isSp500: true },
  { symbol: "B", isSp500: false },
  { symbol: "C", isSp500: true },
] as const;

describe("filterBySp500", () => {
  it("S&P 500 편입 종목만 반환한다", () => {
    expect(filterBySp500(items, "included").map((item) => item.symbol)).toEqual(
      ["A", "C"],
    );
  });

  it("S&P 500 미편입 종목만 반환한다", () => {
    expect(filterBySp500(items, "excluded").map((item) => item.symbol)).toEqual(
      ["B"],
    );
  });

  it("전체 필터에서는 모든 종목을 반환한다", () => {
    expect(filterBySp500(items, "all")).toEqual(items);
  });
});
