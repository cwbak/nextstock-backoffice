import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getNextKrMarketDataEnd,
  krMarketDataInfiniteQueryOptions,
} from "@/data-access/queries/kr-market-data/queries";

const marketData = [
  {
    period: "weekly",
    date: "2026-08-10",
    open: 70_000,
    low: 69_500,
    high: 71_000,
    close: 70_500,
    priceChange: -500,
    volume: 12_345_678,
    value: 870_000_000_000,
  },
];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

describe("KR market data queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("선택한 주기와 기준일의 KR 캔들을 조회한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(marketData));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const result = await queryClient.fetchInfiniteQuery(
      krMarketDataInfiniteQueryOptions({
        stockCode: "005930",
        period: "weekly",
        end: "2026-08-11",
        limit: 100,
      }),
    );

    expect(result.pages[0]).toEqual(marketData);
    expect(result.pageParams).toEqual(["2026-08-11"]);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/005930/market-data?period=weekly&end=2026-08-11&limit=100",
    );
  });

  it("가득 찬 페이지의 가장 이른 날짜 전날부터 다음 페이지를 조회한다", () => {
    expect(
      getNextKrMarketDataEnd(
        [{ date: "2026-08-03" }, { date: "2026-08-10" }],
        2,
      ),
    ).toBe("2026-08-02");
    expect(getNextKrMarketDataEnd([{ date: "2026-08-10" }], 2)).toBe(undefined);
  });
});
