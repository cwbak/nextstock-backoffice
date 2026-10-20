import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sectorQueryOptions,
  sectorsQueryOptions,
} from "@/data-access/queries/sectors/queries";
import type { Sector } from "@/data-access/schemas/sector";
import { mockSectorApi } from "@/test/mocks/sector-api";

describe("sector queries", () => {
  afterEach(() => vi.restoreAllMocks());

  it("실제 정수 응답 형식으로 목록과 단건을 조회한다", async () => {
    const sectors: Sector[] = [
      { id: 237, name: "가구", depth: "minor", parentId: 145 },
      { id: 385, name: "가스수입", depth: "middle", parentId: 255 },
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
    expect(api.fetchMock).not.toHaveBeenCalled();
  });
});
