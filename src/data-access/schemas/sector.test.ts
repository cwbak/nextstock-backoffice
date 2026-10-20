import { describe, expect, it } from "vitest";

import {
  sectorIdSchema,
  sectorSchema,
  sectorListSchema,
  sectorCreatePayloadSchema,
  sectorWritePayloadSchema,
  sectorUpdatePayloadSchema,
  sectorSyncResultSchema,
} from "@/data-access/schemas/sector";

describe("sector schemas", () => {
  it("실제 목록 응답의 정수 ID와 부모 ID를 검증한다", () => {
    const response = [
      { id: 237, name: "가구", depth: "minor", parentId: 145 },
      { id: 385, name: "가스수입", depth: "middle", parentId: 255 },
    ];
    expect(sectorListSchema.parse(response)).toEqual(response);
    expect(
      sectorSchema.parse({
        id: 255,
        name: "에너지",
        depth: "major",
        parentId: null,
      }).parentId,
    ).toBeNull();
  });

  it("정수 ID로 생성하고 이름의 공백을 정리한다", () => {
    expect(
      sectorCreatePayloadSchema.parse({
        id: 42,
        name: " 반도체 ",
        depth: "major",
        parentId: null,
      }),
    ).toEqual({ id: 42, name: "반도체", depth: "major", parentId: null });
    expect(
      sectorCreatePayloadSchema.safeParse({
        name: "반도체",
        depth: "major",
        parentId: null,
      }).success,
    ).toBe(false);
  });

  it.each([1, 2_147_483_647])("허용 범위 경계의 ID %i를 허용한다", (id) => {
    expect(sectorIdSchema.parse(id)).toBe(id);
  });

  it.each([0, -1, 1.5, 2_147_483_648, "42", "", null, undefined])(
    "유효하지 않은 ID %s를 응답과 요청에서 거부한다",
    (id) => {
      expect(
        sectorSchema.safeParse({
          id,
          name: "기술",
          depth: "major",
          parentId: null,
        }).success,
      ).toBe(false);
      expect(
        sectorCreatePayloadSchema.safeParse({
          id,
          name: "기술",
          depth: "major",
          parentId: null,
        }).success,
      ).toBe(false);
      expect(
        sectorSchema.safeParse({
          id: 42,
          name: "반도체",
          depth: "middle",
          parentId: id,
        }).success,
      ).toBe(id === null);
      expect(
        sectorWritePayloadSchema.safeParse({
          name: "반도체",
          depth: "middle",
          parentId: id,
        }).success,
      ).toBe(false);
    },
  );

  it("빈 이름과 자기 자신을 부모로 지정하는 생성·수정을 거부한다", () => {
    expect(
      sectorWritePayloadSchema.safeParse({
        name: "  ",
        depth: "major",
        parentId: null,
      }).success,
    ).toBe(false);
    const payload = { id: 2, name: "반도체", depth: "middle", parentId: 2 };
    expect(sectorCreatePayloadSchema.safeParse(payload).success).toBe(false);
    expect(sectorUpdatePayloadSchema.safeParse(payload).success).toBe(false);
  });

  it.each([
    { name: "기술", depth: "major", parentId: 1 },
    { name: "반도체", depth: "middle", parentId: null },
    { name: "장비", depth: "minor", parentId: null },
    { name: "기술", parentId: null },
    { name: "기술", depth: "unknown", parentId: null },
  ])("분류별 상위 섹터 규칙에 어긋나는 생성·수정을 거부한다", (payload) => {
    expect(
      sectorCreatePayloadSchema.safeParse({ id: 5, ...payload }).success,
    ).toBe(false);
    expect(
      sectorUpdatePayloadSchema.safeParse({ id: 5, ...payload }).success,
    ).toBe(false);
  });

  it("변경이 없는 동기화 결과도 허용한다", () => {
    expect(
      sectorSyncResultSchema.parse({
        created: 0,
        updated: 0,
        deleted: 0,
        unchanged: 10,
      }),
    ).toEqual({ created: 0, updated: 0, deleted: 0, unchanged: 10 });
  });

  it.each([
    { created: -1, updated: 0, deleted: 0, unchanged: 0 },
    { created: 1.5, updated: 0, deleted: 0, unchanged: 0 },
    { created: "1", updated: 0, deleted: 0, unchanged: 0 },
    { created: 1, updated: 0, deleted: 0 },
  ])("잘못되거나 누락된 동기화 건수를 거부한다", (result) => {
    expect(sectorSyncResultSchema.safeParse(result).success).toBe(false);
  });
});
