import { describe, expect, it } from "vitest";

import {
  sectorIdSchema,
  sectorSchema,
  sectorListSchema,
  sectorCreatePayloadSchema,
  sectorWritePayloadSchema,
  sectorUpdatePayloadSchema,
  sectorSyncResultSchema,
  sectorStockListSchema,
} from "@/data-access/schemas/sector";

describe("sector schemas", () => {
  it("실제 목록 응답의 정수 ID와 부모 ID를 검증한다", () => {
    const response = [
      { id: 237, name: "가구", depth: "minor", parentId: 145, isLeaf: true },
      {
        id: 385,
        name: "가스수입",
        depth: "middle",
        parentId: 255,
        isLeaf: false,
      },
    ];
    expect(sectorListSchema.parse(response)).toEqual(response);
    expect(
      sectorSchema.parse({
        id: 255,
        name: "에너지",
        depth: "major",
        parentId: null,
        isLeaf: false,
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
          isLeaf: false,
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
          isLeaf: false,
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

  it.each([true, false])("isLeaf 응답 값 %s를 그대로 유지한다", (isLeaf) => {
    expect(
      sectorSchema.parse({
        id: 42,
        name: "반도체",
        depth: "middle",
        parentId: 10,
        isLeaf,
      }).isLeaf,
    ).toBe(isLeaf);
  });

  it.each([undefined, null, 1, "true"])(
    "누락되거나 boolean이 아닌 isLeaf %s를 거부한다",
    (isLeaf) => {
      expect(
        sectorSchema.safeParse({
          id: 42,
          name: "반도체",
          depth: "middle",
          parentId: 10,
          isLeaf,
        }).success,
      ).toBe(false);
    },
  );

  it("읽기 전용 isLeaf를 생성·수정 요청 필드로 허용하지 않는다", () => {
    const payload = {
      id: 42,
      name: "반도체",
      depth: "middle",
      parentId: 10,
      isLeaf: true,
    };
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
        stocksSynced: 1200,
        stocksSkipped: 3,
      }),
    ).toEqual({
      created: 0,
      updated: 0,
      deleted: 0,
      unchanged: 10,
      stocksSynced: 1200,
      stocksSkipped: 3,
    });
  });

  it.each([
    { created: -1, updated: 0, deleted: 0, unchanged: 0 },
    { created: 1.5, updated: 0, deleted: 0, unchanged: 0 },
    { created: "1", updated: 0, deleted: 0, unchanged: 0 },
    { created: 1, updated: 0, deleted: 0 },
    {
      created: 0,
      updated: 0,
      deleted: 0,
      unchanged: 1,
      stocksSynced: -1,
      stocksSkipped: 0,
    },
    {
      created: 0,
      updated: 0,
      deleted: 0,
      unchanged: 1,
      stocksSynced: 1,
      stocksSkipped: 0.5,
    },
  ])("잘못되거나 누락된 동기화 건수를 거부한다", (result) => {
    expect(
      sectorSyncResultSchema.safeParse({
        stocksSynced: 0,
        stocksSkipped: 0,
        ...result,
      }).success,
    ).toBe(false);
  });

  it("섹터 종목은 코드와 이름 배열이며 코드의 앞자리 0을 유지한다", () => {
    const stocks = [
      { code: "005930", name: "삼성전자" },
      { code: "00088K", name: "한화3우B" },
    ];
    expect(sectorStockListSchema.parse(stocks)).toEqual(stocks);
    expect(sectorStockListSchema.parse([])).toEqual([]);
    expect(
      sectorStockListSchema.safeParse([{ code: 5930, name: "삼성전자" }])
        .success,
    ).toBe(false);
    expect(
      sectorStockListSchema.safeParse([
        { stock_code: "005930", name: "삼성전자" },
      ]).success,
    ).toBe(false);
  });
});
