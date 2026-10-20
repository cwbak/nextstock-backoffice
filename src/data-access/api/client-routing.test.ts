import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  sectorStocksQueryOptions,
  sectorsQueryOptions,
} from "@/data-access/queries/sectors/queries";

const apiEnv = vi.hoisted(() => ({
  adminApiUrl: "http://127.0.0.1:8081",
  apiUrl: "http://127.0.0.1:8080",
}));
vi.mock("@/lib/env", () => ({ env: apiEnv }));

function mockResponse(body: unknown) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body)));
}

describe("API server routing", () => {
  beforeEach(() => {
    apiEnv.adminApiUrl = "http://127.0.0.1:8081";
    apiEnv.apiUrl = "http://127.0.0.1:8080";
  });
  afterEach(() => vi.restoreAllMocks());

  it("관리자 섹터 목록은 VITE_ADMIN_API_URL의 8081로 요청한다", async () => {
    const fetchMock = mockResponse([]);
    await new QueryClient().fetchQuery(sectorsQueryOptions);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/admin/sectors",
      expect.anything(),
    );
  });

  it("섹터 종목은 VITE_API_URL의 8080으로 요청한다", async () => {
    const stocks = [{ code: "005930", name: "삼성전자" }];
    const fetchMock = mockResponse(stocks);
    await expect(
      new QueryClient().fetchQuery(sectorStocksQueryOptions(103)),
    ).resolves.toEqual(stocks);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8080/api/sectors/103/stocks",
      expect.anything(),
    );
  });

  it("동기화 등록과 worker 상태 조회도 관리자 서버로 요청한다", async () => {
    const fetchMock = mockResponse({});
    await apiRequest("/admin/sectors/sync", z.object({}), { method: "POST" });
    // 각 요청에서 응답 본문을 한 번씩 읽을 수 있도록 새 응답을 제공한다.
    fetchMock.mockResolvedValueOnce(new Response("{}"));
    await apiRequest("/admin/jobs/42", z.object({}));
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://127.0.0.1:8081/admin/sectors/sync",
      "http://127.0.0.1:8081/admin/jobs/42",
    ]);
  });

  it("응답 본문이 없는 관리자 삭제도 같은 주소 분리를 적용한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    await apiRequestVoid("/admin/sectors/103", { method: "DELETE" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/admin/sectors/103",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it.each([
    ["/admin/sectors", "https://admin.example.com/gateway/admin/sectors"],
    [
      "/api/sectors/103/stocks",
      "https://api.example.com/gateway/api/sectors/103/stocks",
    ],
  ])(
    "설정 주소의 마지막 슬래시와 경로 접두어를 처리한다: %s",
    async (path, expected) => {
      apiEnv.adminApiUrl = "https://admin.example.com/gateway///";
      apiEnv.apiUrl = "https://api.example.com/gateway/";
      const fetchMock = mockResponse({});
      await apiRequest(path, z.object({}));
      expect(fetchMock).toHaveBeenCalledWith(expected, expect.anything());
    },
  );
});
