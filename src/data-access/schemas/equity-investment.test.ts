import { describe, expect, it } from "vitest";

import {
  equityInvestmentBulkCreateResultSchema,
  equityInvestmentCreatePayloadSchema,
  equityInvestmentCreateResultSchema,
  equityInvestmentSchema,
} from "@/data-access/schemas/equity-investment";

describe("equity investment schemas", () => {
  it("지분투자 응답의 투자 대상 정보를 검증한다", () => {
    expect(
      equityInvestmentSchema.parse({
        corpCode: "00126380",
        invName: "삼성디스플레이",
        bsnsYear: 2026,
        status: "OK",
        invstmntPurps: "경영참여",
        trmendBlceQotaRt: "84.80",
      }),
    ).toMatchObject({
      corpCode: "00126380",
      invName: "삼성디스플레이",
      bsnsYear: 2026,
      status: "OK",
      invstmntPurps: "경영참여",
      trmendBlceQotaRt: "84.80",
    });
  });

  it("확보하지 못한 출자목적과 숫자가 아닌 지분율의 null을 허용한다", () => {
    expect(
      equityInvestmentSchema.parse({
        corpCode: "00126380",
        invName: "비상장기업",
        bsnsYear: 2026,
        status: "OK",
        invstmntPurps: null,
        trmendBlceQotaRt: null,
      }),
    ).toMatchObject({
      invstmntPurps: null,
      trmendBlceQotaRt: null,
    });
  });

  it("사업연도와 보고서 구분을 검증한다", () => {
    expect(
      equityInvestmentCreatePayloadSchema.safeParse({
        corpCode: "00126380",
        bsnsYear: "25",
        reprtCode: 5,
      }).success,
    ).toBe(false);
  });

  it("전체 법인 DRAFT 생성 집계 응답을 검증한다", () => {
    expect(
      equityInvestmentBulkCreateResultSchema.parse({
        bsnsYear: "2025",
        reprtCode: 4,
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

  it("삭제된 미매칭 건수를 포함한 이전 생성 응답을 거부한다", () => {
    expect(
      equityInvestmentCreateResultSchema.safeParse({
        corpCode: "00126380",
        bsnsYear: "2025",
        reprtCode: 4,
        fetchedCount: 12,
        upsertedCount: 12,
        unmatchedCount: 0,
      }).success,
    ).toBe(false);
  });

  it("목록 응답은 사업연도와 OK 상태를 필수로 검증한다", () => {
    const baseResponse = {
      corpCode: "00126380",
      invName: "삼성디스플레이",
      bsnsYear: 2026,
      status: "OK",
      invstmntPurps: "경영참여",
      trmendBlceQotaRt: "84.80",
    } as const;

    expect(equityInvestmentSchema.parse(baseResponse)).toMatchObject({
      bsnsYear: 2026,
      status: "OK",
    });
    expect(
      equityInvestmentSchema.safeParse({
        ...baseResponse,
        status: "DRAFT",
      }).success,
    ).toBe(false);
  });

  it("삭제된 상장 여부 필드를 포함한 이전 응답 형식을 거부한다", () => {
    expect(
      equityInvestmentSchema.safeParse({
        corpCode: "00126380",
        invName: "삼성디스플레이",
        invListed: true,
        bsnsYear: 2026,
        status: "OK",
        invstmntPurps: "경영참여",
        trmendBlceQotaRt: "84.80",
      }).success,
    ).toBe(false);
  });
});
