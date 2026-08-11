import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { krxMarketDataQueryOptions } from "@/data-access/queries/krx-market-data/queries";

const marketData = [
  {
    date: "2026-08-10",
    open: 70_000,
    low: 69_500,
    high: 71_000,
    close: 70_500,
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

describe("KRX market data queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("선택한 날짜 범위의 KRX 일봉을 조회한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(marketData));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery(
        krxMarketDataQueryOptions({
          stockCode: "005930",
          from: "2026-01-01",
          to: "2026-08-10",
        }),
      ),
    ).resolves.toEqual(marketData);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/krx-stocks/005930/market-data?from=2026-01-01&to=2026-08-10",
    );
  });

  it("비어 있는 날짜는 쿼리 파라미터에서 제외한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([]));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await queryClient.fetchQuery(
      krxMarketDataQueryOptions({
        stockCode: "005930",
        from: "",
        to: "",
      }),
    );

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/krx-stocks/005930/market-data",
    );
  });
});
