import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sectorQueryOptions,
  sectorsQueryOptions,
} from "@/data-access/queries/sectors/queries";
import { mockSectorApi } from "@/test/mocks/sector-api";

describe("sector queries", () => {
  afterEach(() => vi.restoreAllMocks());

  it("전체 목록과 단건을 각각의 API에서 조회한다", async () => {
    const sector = { id: 1, name: "기술", parentId: null };
    const api = mockSectorApi([sector]);
    const client = new QueryClient();
    await expect(client.fetchQuery(sectorsQueryOptions)).resolves.toEqual([
      sector,
    ]);
    await expect(client.fetchQuery(sectorQueryOptions(1))).resolves.toEqual(
      sector,
    );
    expect(api.fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/admin/sectors",
      "/admin/sectors/1",
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
});
