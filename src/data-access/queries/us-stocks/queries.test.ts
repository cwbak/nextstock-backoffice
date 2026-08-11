import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usStocksQueryOptions } from "@/data-access/queries/us-stocks/queries";

const listResult = [
  {
    symbol: "A",
    name: "Agilent Technologies Inc. Common Stock",
    marketCap: "39314526605.00",
    country: "United States",
    ipoYear: 1999,
    sector: "Industrials",
    industry: "Biotechnology: Laboratory Analytical Instruments",
    isSp500: true,
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
  },
] as const;

describe("US stock queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("US 종목 정보 목록을 조회한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(listResult), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(queryClient.fetchQuery(usStocksQueryOptions)).resolves.toEqual(
      listResult,
    );
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/us-stocks");
  });
});
