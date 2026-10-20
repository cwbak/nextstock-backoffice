import { describe, expect, it } from "vitest";

import {
  sectorSchema,
  sectorWritePayloadSchema,
  sectorUpdatePayloadSchema,
} from "@/data-access/schemas/sector";

describe("sector schemas", () => {
  it("날짜 필드가 없는 섹터 응답과 nullable 상위 ID를 검증한다", () => {
    const sector = { id: 2, name: "반도체", depth: "middle", parentId: 1 };
    expect(sectorSchema.parse(sector)).toEqual(sector);
    expect(
      sectorSchema.parse({ ...sector, depth: "major", parentId: null })
        .parentId,
    ).toBeNull();
  });

  it("이름의 공백을 정리하고 대분류 요청을 검증한다", () => {
    expect(
      sectorWritePayloadSchema.parse({
        name: " 반도체 ",
        depth: "major",
        parentId: null,
      }),
    ).toEqual({ name: "반도체", depth: "major", parentId: null });
  });

  it.each([
    { id: 0, name: "반도체", parentId: null },
    { id: 1, name: "반도체", parentId: "2" },
    { id: 1, name: "반도체" },
    { id: 1, name: "기술", depth: "unknown", parentId: null },
    { id: 1, name: "기술", parentId: null },
  ])("유효하지 않은 응답을 거부한다", (sector) => {
    expect(sectorSchema.safeParse(sector).success).toBe(false);
  });

  it("빈 이름과 자기 자신을 상위로 지정하는 수정을 거부한다", () => {
    expect(
      sectorWritePayloadSchema.safeParse({
        name: "  ",
        depth: "major",
        parentId: null,
      }).success,
    ).toBe(false);
    expect(
      sectorUpdatePayloadSchema.safeParse({
        id: 2,
        name: "반도체",
        depth: "middle",
        parentId: 2,
      }).success,
    ).toBe(false);
  });

  it.each([
    { name: "기술", depth: "major", parentId: 1 },
    { name: "반도체", depth: "middle", parentId: null },
    { name: "장비", depth: "minor", parentId: null },
    { name: "기술", parentId: null },
  ])(
    "분류별 상위 섹터 규칙에 어긋나는 생성·수정 요청을 거부한다",
    (payload) => {
      expect(sectorWritePayloadSchema.safeParse(payload).success).toBe(false);
      expect(
        sectorUpdatePayloadSchema.safeParse({ id: 5, ...payload }).success,
      ).toBe(false);
    },
  );
});
