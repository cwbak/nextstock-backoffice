import { afterEach, describe, expect, it, vi } from "vitest";

import { createKrxMarketData } from "@/data-access/queries/krx-market-data/mutations";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

describe("KRX market data mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("한국투자증권 일봉을 조회해 저장한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        fetchedCount: 145,
        insertedCount: 140,
      }),
    );

    await expect(
      createKrxMarketData({
        stockCode: "005930",
        from: "2026-01-01",
        to: "2026-08-10",
      }),
    ).resolves.toEqual({ fetchedCount: 145, insertedCount: 140 });

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/krx-stocks/005930/market-data",
    );
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      from: "2026-01-01",
      to: "2026-08-10",
    });
  });
});
