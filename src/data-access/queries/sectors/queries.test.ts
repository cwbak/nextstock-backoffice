import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sectorQueryOptions,
  sectorsQueryOptions,
  sectorStocksQueryOptions,
} from "@/data-access/queries/sectors/queries";
import type { Sector } from "@/data-access/schemas/sector";
import { mockSectorApi } from "@/test/mocks/sector-api";

describe("sector queries", () => {
  afterEach(() => vi.restoreAllMocks());

  it("실제 정수 응답 형식으로 목록과 단건을 조회한다", async () => {
    const sectors: Sector[] = [
      { id: 237, name: "가구", depth: "minor", parentId: 145, isLeaf: false },
      {
        id: 385,
        name: "가스수입",
        depth: "middle",
        parentId: 255,
        isLeaf: false,
      },
    ];
    const api = mockSectorApi(sectors);
    const client = new QueryClient();
    await expect(client.fetchQuery(sectorsQueryOptions)).resolves.toEqual(
      sectors,
    );
    const options = sectorQueryOptions(237);
    expect(options.queryKey).toEqual(["sectors", "detail", 237]);
    await expect(client.fetchQuery(options)).resolves.toEqual(sectors[0]);
    expect(api.fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/admin/sectors",
      "/admin/sectors/237",
    ]);
    expect(api.fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(
      AbortSignal,
    );
  });

  it("빈 목록은 빈 배열로 처리한다", async () => {
    mockSectorApi([]);
    await expect(
      new QueryClient().fetchQuery(sectorsQueryOptions),
    ).resolves.toEqual([]);
  });

  it("유효하지 않은 ID로 단건 조회 요청을 보내지 않는다", async () => {
    const api = mockSectorApi([]);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await expect(client.fetchQuery(sectorQueryOptions(0))).rejects.toThrow();
    await expect(
      client.fetchQuery(sectorStocksQueryOptions(0)),
    ).rejects.toThrow();
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("섹터 종목을 공개 API에서 조회하고 섹터별로 캐시를 분리한다", async () => {
    const api = mockSectorApi([
      { id: 10, name: "기술", depth: "major", parentId: null, isLeaf: false },
      { id: 42, name: "반도체", depth: "middle", parentId: 10, isLeaf: false },
    ]);
    const stocks = [{ code: "005930", name: "삼성전자" }];
    api.stocks.set(10, stocks);
    const client = new QueryClient();
    expect(sectorStocksQueryOptions(10).queryKey).toEqual([
      "sectors",
      "stocks",
      10,
    ]);
    await expect(
      client.fetchQuery(sectorStocksQueryOptions(10)),
    ).resolves.toEqual(stocks);
    await expect(
      client.fetchQuery(sectorStocksQueryOptions(42)),
    ).resolves.toEqual([]);
    expect(api.fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/sectors/10/stocks",
      "/api/sectors/42/stocks",
    ]);
    expect(api.fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(
      AbortSignal,
    );
  });
});
