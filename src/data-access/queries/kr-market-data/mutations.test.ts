import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createKisDailyMarketData,
  createKrxDailyMarketData,
  createKrMarketData,
} from "@/data-access/queries/kr-market-data/mutations";

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

describe("KR market data mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("KRX 일자별 전 종목 일봉을 날짜 구간으로 조회해 저장한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        fetchedCount: 10_850,
        insertedCount: 10_720,
      }),
    );

    await expect(
      createKrxDailyMarketData({
        from: "2026-08-01",
        to: "2026-08-10",
      }),
    ).resolves.toEqual({
      fetchedCount: 10_850,
      insertedCount: 10_720,
    });

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/kr-stocks/market-data/krx-daily",
    );
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      from: "2026-08-01",
      to: "2026-08-10",
    });
  });

  it("한국투자증권 일봉을 조회해 저장한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        fetchedCount: 145,
        insertedCount: 140,
      }),
    );

    await expect(
      createKrMarketData({
        stockCode: "005930",
        from: "2026-01-01",
        to: "2026-08-10",
      }),
    ).resolves.toEqual({
      fetchedCount: 145,
      insertedCount: 140,
    });

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/kr-stocks/005930/market-data",
    );
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      from: "2026-01-01",
      to: "2026-08-10",
    });
  });

  it("KIS 전 종목 기간 일봉 작업을 등록한다", async () => {
    const registration = {
      jobId: 52,
      type: "kr_stocks_kis_daily",
      status: "QUEUED",
      statusUrl: "/admin/jobs/52",
      created: true,
      createdAt: "2026-08-18T10:00:00+09:00",
    } as const;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(registration), {
        headers: { "Content-Type": "application/json" },
        status: 202,
      }),
    );

    await expect(
      createKisDailyMarketData({
        from: "2026-01-01",
        to: "2026-08-10",
      }),
    ).resolves.toEqual(registration);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/kr-stocks/market-data/kis-daily",
    );
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      from: "2026-01-01",
      to: "2026-08-10",
    });
  });
});
