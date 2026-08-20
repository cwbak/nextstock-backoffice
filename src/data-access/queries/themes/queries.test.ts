import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  themesQueryOptions,
  themeStocksQueryOptions,
} from "@/data-access/queries/themes/queries";

const themes = [
  {
    id: 449,
    parentThemeId: null,
    name: "2차전지(생산)",
    createdAt: "2026-08-09T10:00:00+09:00",
    updatedAt: "2026-08-09T10:00:00+09:00",
  },
] as const;

const stocks = [
  {
    code: "006400",
    corporationCode: "00126362",
    name: "삼성SDI",
    marketType: "KOSPI",
    stockType: "보통주",
    status: "ACTIVE",
    listDd: "1979-02-27",
    parval: 5_000,
    listShrs: 80_585_530,
    createdAt: "2026-08-09T10:00:00+09:00",
    updatedAt: "2026-08-09T10:00:00+09:00",
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

describe("theme queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("시스템 테마 목록을 조회한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(themes));

    await expect(
      createQueryClient().fetchQuery(themesQueryOptions),
    ).resolves.toEqual(themes);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/themes");
  });

  it("선택한 테마의 KR 종목 목록을 조회한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(stocks));

    await expect(
      createQueryClient().fetchQuery(themeStocksQueryOptions(449)),
    ).resolves.toEqual(stocks);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/themes/449/stocks");
  });
});
