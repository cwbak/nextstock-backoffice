import { afterEach, describe, expect, it, vi } from "vitest";

import {
  syncCorporations,
  upsertCorporation,
  updateCorporation,
} from "@/data-access/queries/corporations/mutations";
import type {
  Corporation,
  CorporationFormValues,
} from "@/data-access/schemas/corporation";

const formValues: CorporationFormValues = {
  accMt: 12,
  address: "경기도 수원시 영통구 삼성로 129",
  ceoNm: "한종희",
  code: "00126380",
  estDt: "1969-01-13",
  hmUrl: "https://www.samsung.com/sec",
  indutyCode: "264",
  name: "삼성전자",
  nameEn: "Samsung Electronics",
  products: "반도체\n\n 스마트폰 ",
  summary: "전자제품 제조\n글로벌 기업",
};

const corporation: Corporation = {
  accMt: 12,
  address: "경기도 수원시 영통구 삼성로 129",
  ceoNm: "한종희",
  code: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  estDt: "1969-01-13",
  hmUrl: "https://www.samsung.com/sec",
  indutyCode: "264",
  info: null,
  name: "삼성전자",
  nameEn: "Samsung Electronics",
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

describe("corporation mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("요청 본문 없이 DART 법인명 동기화를 요청한다", async () => {
    const result = {
      jobId: 42,
      type: "corporations_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/42",
      created: true,
      createdAt: "2026-08-13T11:00:00+09:00",
    } as const;
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(result));

    await expect(syncCorporations()).resolves.toEqual(result);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations/sync");
    expect(request?.method).toBe("POST");
    expect(request?.body).toBeUndefined();
  });

  it("법인 코드로 DART 법인을 생성·갱신한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(corporation));

    await expect(upsertCorporation({ code: "00126380" })).resolves.toEqual(
      corporation,
    );

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({ code: "00126380" });
  });

  it("기본 정보 수정 후 새 info API에 줄 단위 배열을 저장한다", async () => {
    const updatedCorporation: Corporation = {
      ...corporation,
      info: {
        product: ["반도체", "스마트폰"],
        summary: ["전자제품 제조", "글로벌 기업"],
      },
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(corporation))
      .mockResolvedValueOnce(jsonResponse(updatedCorporation));

    await expect(updateCorporation(formValues)).resolves.toEqual(
      updatedCorporation,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations/00126380");
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "/admin/corporations/00126380/info",
    );

    const basicRequest = fetchMock.mock.calls[0]?.[1];
    const infoRequest = fetchMock.mock.calls[1]?.[1];

    expect(basicRequest?.method).toBe("PUT");
    expect(parseRequestBody(basicRequest?.body)).toEqual({
      accMt: 12,
      address: "경기도 수원시 영통구 삼성로 129",
      ceoNm: "한종희",
      estDt: "1969-01-13",
      hmUrl: "https://www.samsung.com/sec",
      indutyCode: "264",
      name: "삼성전자",
      nameEn: "Samsung Electronics",
    });
    expect(infoRequest?.method).toBe("PUT");
    expect(parseRequestBody(infoRequest?.body)).toEqual({
      info: {
        product: ["반도체", "스마트폰"],
        summary: ["전자제품 제조", "글로벌 기업"],
      },
    });
  });
});
