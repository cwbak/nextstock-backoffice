import { describe, expect, it } from "vitest";

import {
  themeCreatePayloadSchema,
  themeSchema,
  themeStockCreatePayloadSchema,
  themeStockDeletePayloadSchema,
} from "@/data-access/schemas/theme";

const themeResponse = {
  id: 449,
  parentThemeId: null,
  name: "2차전지(생산)",
  createdAt: "2026-08-09T10:00:00+09:00",
  updatedAt: "2026-08-09T10:00:00+09:00",
} as const;

describe("themeSchema", () => {
  it("최상위 테마 응답을 검증한다", () => {
    expect(themeSchema.parse(themeResponse)).toEqual(themeResponse);
  });

  it("하위 테마의 parentThemeId를 검증한다", () => {
    expect(
      themeSchema.parse({
        ...themeResponse,
        id: 450,
        parentThemeId: 449,
        name: "2차전지(소재)",
      }).parentThemeId,
    ).toBe(449);
  });

  it("테마 ID가 양의 정수가 아니면 거부한다", () => {
    expect(() => themeSchema.parse({ ...themeResponse, id: 0 })).toThrow();
  });
});

describe("themeCreatePayloadSchema", () => {
  it("테마명을 정리하고 최상위 테마 생성 값을 검증한다", () => {
    expect(
      themeCreatePayloadSchema.parse({
        id: 500,
        parentThemeId: null,
        name: " 신규 테마 ",
      }),
    ).toEqual({ id: 500, parentThemeId: null, name: "신규 테마" });
  });

  it("자기 자신을 상위 테마로 지정하면 거부한다", () => {
    expect(() =>
      themeCreatePayloadSchema.parse({
        id: 500,
        parentThemeId: 500,
        name: "신규 테마",
      }),
    ).toThrow("상위 테마는 생성할 테마와 달라야 합니다.");
  });
});

describe("themeStockCreatePayloadSchema", () => {
  it("테마 ID와 KR 종목 코드를 검증한다", () => {
    expect(
      themeStockCreatePayloadSchema.parse({
        themeId: 449,
        stockCode: "005930",
      }),
    ).toEqual({ themeId: 449, stockCode: "005930" });
  });

  it("6자리가 아닌 종목 코드는 거부한다", () => {
    expect(() =>
      themeStockCreatePayloadSchema.parse({
        themeId: 449,
        stockCode: "5930",
      }),
    ).toThrow();
  });
});

describe("themeStockDeletePayloadSchema", () => {
  it("삭제할 테마 ID와 KR 종목 코드를 검증한다", () => {
    expect(
      themeStockDeletePayloadSchema.parse({
        themeId: 449,
        stockCode: "005930",
      }),
    ).toEqual({ themeId: 449, stockCode: "005930" });
  });

  it("양의 정수가 아닌 테마 ID는 거부한다", () => {
    expect(() =>
      themeStockDeletePayloadSchema.parse({
        themeId: 0,
        stockCode: "005930",
      }),
    ).toThrow();
  });
});
