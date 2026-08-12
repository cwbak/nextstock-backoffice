import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createKrStock,
  syncKrStocks,
  updateKrStock,
} from "@/data-access/queries/kr-stocks/mutations";
import type {
  KrStock,
  KrStockFormValues,
} from "@/data-access/schemas/kr-stock";

const formValues: KrStockFormValues = {
  code: "005930",
  corporationCode: "00126380",
  listDd: "1975-06-11",
  listShrs: 5_969_782_550,
  marketType: "KOSPI",
  name: "삼성전자",
  parval: null,
  stockType: "보통주",
};

const krStock: KrStock = {
  ...formValues,
  createdAt: "2026-07-25T10:00:00+09:00",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

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

describe("KR stock mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("요청 본문 없이 KRX 전체 종목 동기화를 요청한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        fetchedCount: 2_785,
        updatedCount: 12,
      }),
    );

    await expect(syncKrStocks()).resolves.toEqual({
      fetchedCount: 2_785,
      updatedCount: 12,
    });

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks/sync");
    expect(request?.method).toBe("POST");
    expect(request?.body).toBeUndefined();
  });

  it("생성 요청에는 DART 법인 코드와 종목 코드만 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(krStock), {
        headers: { "Content-Type": "application/json" },
        status: 201,
      }),
    );

    await expect(
      createKrStock({
        corporationCode: "00126380",
        stockCode: "005930",
      }),
    ).resolves.toEqual(krStock);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      corporationCode: "00126380",
      stockCode: "005930",
    });
  });

  it("nullable 상장 정보를 포함한 수정 payload를 전송한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(krStock));

    await expect(updateKrStock(formValues)).resolves.toEqual(krStock);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks/005930");

    const request = fetchMock.mock.calls[0]?.[1];

    expect(request?.method).toBe("PUT");
    expect(parseRequestBody(request?.body)).toEqual({
      corporationCode: "00126380",
      listDd: "1975-06-11",
      listShrs: 5_969_782_550,
      marketType: "KOSPI",
      name: "삼성전자",
      parval: null,
      stockType: "보통주",
    });
  });
});
