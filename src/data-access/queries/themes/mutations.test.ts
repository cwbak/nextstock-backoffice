import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTheme,
  createThemeStock,
} from "@/data-access/queries/themes/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import type { Theme } from "@/data-access/schemas/theme";

const theme: Theme = {
  id: 500,
  parentThemeId: 449,
  name: "신규 테마",
  createdAt: "2026-08-10T10:00:00+09:00",
  updatedAt: "2026-08-10T10:00:00+09:00",
};

const stock: KrStock = {
  code: "005930",
  corporationCode: "00126380",
  name: "삼성전자",
  marketType: "KOSPI",
  stockType: "보통주",
  status: "ACTIVE",
  listDd: "1975-06-11",
  parval: 100,
  listShrs: 5_969_782_550,
  createdAt: "2026-08-10T10:00:00+09:00",
  updatedAt: "2026-08-10T10:00:00+09:00",
};

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

describe("theme mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("시스템 테마를 생성한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(theme));

    await expect(
      createTheme({
        id: 500,
        parentThemeId: 449,
        name: " 신규 테마 ",
      }),
    ).resolves.toEqual(theme);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/themes");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      id: 500,
      parentThemeId: 449,
      name: "신규 테마",
    });
  });

  it("선택한 테마에 KR 종목을 추가한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(stock));

    await expect(
      createThemeStock({ themeId: 449, stockCode: "005930" }),
    ).resolves.toEqual(stock);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/themes/449/stocks");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({ stockCode: "005930" });
  });
});
