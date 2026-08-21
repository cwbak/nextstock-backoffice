import { describe, expect, it } from "vitest";

import {
  equityInvestmentBulkCreateResultSchema,
  equityInvestmentCreatePayloadSchema,
  equityInvestmentCreateResultSchema,
  equityInvestmentSchema,
} from "@/data-access/schemas/equity-investment";

const investmentResponse = {
  corpCode: "00126380",
  invName: "삼성디스플레이",
  trmendBlceQotaRt: "84.80",
} as const;

describe("equity investment schemas", () => {
  it("최신 출자현황 응답의 투자 대상 정보를 검증한다", () => {
    expect(equityInvestmentSchema.parse(investmentResponse)).toEqual(
      investmentResponse,
    );
  });

  it("숫자가 아닌 지분율의 null을 허용한다", () => {
    expect(
      equityInvestmentSchema.parse({
        ...investmentResponse,
        invName: "비상장기업",
        trmendBlceQotaRt: null,
      }),
    ).toMatchObject({ trmendBlceQotaRt: null });
  });

  it("목록에서 삭제된 사업연도와 상태 필드를 거부한다", () => {
    expect(
      equityInvestmentSchema.safeParse({
        ...investmentResponse,
        bsnsYear: 2026,
        status: "OK",
      }).success,
    ).toBe(false);
  });

  it("단건 동기화 요청은 법인 코드만 허용한다", () => {
    expect(
      equityInvestmentCreatePayloadSchema.parse({ corpCode: "00126380" }),
    ).toEqual({ corpCode: "00126380" });
    expect(
      equityInvestmentCreatePayloadSchema.safeParse({
        corpCode: "00126380",
        bsnsYear: "2025",
        reprtCode: 4,
      }).success,
    ).toBe(false);
  });

  it("단건 동기화 결과를 검증한다", () => {
    expect(
      equityInvestmentCreateResultSchema.parse({
        corpCode: "00126380",
        fetchedCount: 12,
        upsertedCount: 12,
      }),
    ).toEqual({
      corpCode: "00126380",
      fetchedCount: 12,
      upsertedCount: 12,
    });
  });

  it("단건 동기화 결과의 삭제된 기간 필드를 거부한다", () => {
    expect(
      equityInvestmentCreateResultSchema.safeParse({
        corpCode: "00126380",
        bsnsYear: "2025",
        reprtCode: 4,
        fetchedCount: 12,
        upsertedCount: 12,
      }).success,
    ).toBe(false);
  });

  it("전체 법인 동기화 집계 응답을 검증한다", () => {
    expect(
      equityInvestmentBulkCreateResultSchema.parse({
        corporationCount: 2_400,
        processedCount: 2_200,
        failedCount: 200,
        fetchedCount: 15_000,
        upsertedCount: 14_000,
      }),
    ).toMatchObject({
      corporationCount: 2_400,
      processedCount: 2_200,
      failedCount: 200,
    });
  });

  it("전체 법인 동기화 결과의 삭제된 기간 필드를 거부한다", () => {
    expect(
      equityInvestmentBulkCreateResultSchema.safeParse({
        bsnsYear: "2025",
        reprtCode: 4,
        corporationCount: 2_400,
        processedCount: 2_200,
        failedCount: 200,
        fetchedCount: 15_000,
        upsertedCount: 14_000,
      }).success,
    ).toBe(false);
  });

  it("삭제된 출자목적 필드를 포함한 이전 응답 형식을 거부한다", () => {
    expect(
      equityInvestmentSchema.safeParse({
        ...investmentResponse,
        invstmntPurps: "경영참여",
      }).success,
    ).toBe(false);
  });
});
