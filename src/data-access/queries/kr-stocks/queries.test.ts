import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  krStockNameAliasesQueryOptions,
  krStocksQueryOptions,
} from "@/data-access/queries/kr-stocks/queries";

const stocks = [
  {
    code: "005930",
    corporationCode: "00126380",
    createdAt: "2026-07-25T10:00:00+09:00",
    listDd: "1975-06-11",
    listShrs: 5_969_782_550,
    marketType: "KOSPI",
    name: "삼성전자",
    parval: 100,
    status: "ACTIVE",
    stockType: "보통주",
    updatedAt: "2026-07-26T11:00:00+09:00",
  },
] as const;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

describe("KR stock queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("KR 종목 목록을 stocks 경로에서 조회한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(stocks));

    await expect(
      createQueryClient().fetchQuery(krStocksQueryOptions),
    ).resolves.toEqual(stocks);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/stocks");
  });

  it("KR 종목명 별칭을 stocks 경로에서 조회한다", async () => {
    const aliases = ["삼성전자 보통주", "삼전"];
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(aliases));

    await expect(
      createQueryClient().fetchQuery(krStockNameAliasesQueryOptions("005930")),
    ).resolves.toEqual(aliases);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/005930/name-aliases",
    );
  });
});
