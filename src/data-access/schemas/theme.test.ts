import { describe, expect, it } from "vitest";

import { themeSchema } from "@/data-access/schemas/theme";

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
