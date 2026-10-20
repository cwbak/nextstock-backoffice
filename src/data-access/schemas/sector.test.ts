import { describe, expect, it } from "vitest";

import {
  sectorSchema,
  sectorWritePayloadSchema,
  sectorUpdatePayloadSchema,
} from "@/data-access/schemas/sector";

describe("sector schemas", () => {
  it("날짜 필드가 없는 섹터 응답과 nullable 상위 ID를 검증한다", () => {
    const sector = { id: 2, name: "반도체", parentId: 1 };
    expect(sectorSchema.parse(sector)).toEqual(sector);
    expect(
      sectorSchema.parse({ ...sector, parentId: null }).parentId,
    ).toBeNull();
  });

  it("이름의 공백을 정리하고 최상위 이동 요청을 검증한다", () => {
    expect(
      sectorWritePayloadSchema.parse({ name: " 반도체 ", parentId: null }),
    ).toEqual({ name: "반도체", parentId: null });
  });

  it.each([
    { id: 0, name: "반도체", parentId: null },
    { id: 1, name: "반도체", parentId: "2" },
    { id: 1, name: "반도체" },
  ])("유효하지 않은 응답을 거부한다", (sector) => {
    expect(sectorSchema.safeParse(sector).success).toBe(false);
  });

  it("빈 이름과 자기 자신을 상위로 지정하는 수정을 거부한다", () => {
    expect(
      sectorWritePayloadSchema.safeParse({ name: "  ", parentId: null })
        .success,
    ).toBe(false);
    expect(
      sectorUpdatePayloadSchema.safeParse({
        id: 2,
        name: "반도체",
        parentId: 2,
      }).success,
    ).toBe(false);
  });
});
