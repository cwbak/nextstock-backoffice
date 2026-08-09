import { describe, expect, it } from "vitest";

import { krxStockSchema } from "@/data-access/schemas/krx-stock";

const krxStockResponse = {
  code: "005930",
  corporationCode: "00126380",
  name: "삼성전자",
  marketType: "KOSPI",
  stockType: "보통주",
  listDd: "1975-06-11",
  createdAt: "2026-07-30T17:49:28.993831+09:00",
  updatedAt: "2026-07-30T17:49:28.993831+09:00",
} as const;

describe("krxStockSchema", () => {
  it("parval과 listShrs가 누락된 이전 응답을 null로 정규화한다", () => {
    expect(krxStockSchema.parse(krxStockResponse)).toMatchObject({
      parval: null,
      listShrs: null,
    });
  });

  it("parval과 listShrs를 새 응답에서 검증한다", () => {
    expect(
      krxStockSchema.parse({
        ...krxStockResponse,
        parval: 100,
        listShrs: 5_969_782_550,
      }),
    ).toMatchObject({
      parval: 100,
      listShrs: 5_969_782_550,
    });
  });

  it("stockType을 필수 주식 종류로 검증한다", () => {
    expect(() =>
      krxStockSchema.parse({
        ...krxStockResponse,
        stockType: undefined,
      }),
    ).toThrow();
    expect(
      krxStockSchema.parse({
        ...krxStockResponse,
        stockType: " 보통주 ",
      }).stockType,
    ).toBe("보통주");
  });
});
