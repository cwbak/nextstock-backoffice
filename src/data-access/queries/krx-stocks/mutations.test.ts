import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createKrxStock,
  updateKrxStock,
} from "@/data-access/queries/krx-stocks/mutations";
import type {
  KrxStock,
  KrxStockFormValues,
} from "@/data-access/schemas/krx-stock";

const formValues: KrxStockFormValues = {
  code: "005930",
  corporationCode: "00126380",
  listDd: "1975-06-11",
  listShrs: 5_969_782_550,
  marketType: "KOSPI",
  name: "삼성전자",
  parval: null,
  stockType: "보통주",
};

const krxStock: KrxStock = {
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

describe("KRX stock mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("생성 요청에는 DART 법인 코드와 종목 코드만 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(krxStock), {
        headers: { "Content-Type": "application/json" },
        status: 201,
      }),
    );

    await expect(
      createKrxStock({
        corporationCode: "00126380",
        stockCode: "005930",
      }),
    ).resolves.toEqual(krxStock);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/krx-stocks");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      corporationCode: "00126380",
      stockCode: "005930",
    });
  });

  it("nullable 상장 정보를 포함한 수정 payload를 전송한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(krxStock));

    await expect(updateKrxStock(formValues)).resolves.toEqual(krxStock);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/krx-stocks/005930");

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
