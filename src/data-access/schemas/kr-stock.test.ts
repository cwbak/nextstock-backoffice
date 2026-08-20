import { describe, expect, it } from "vitest";

import {
  krStockSchema,
  krStockSyncResultSchema,
  krStockUpsertPayloadSchema,
} from "@/data-access/schemas/kr-stock";

const krStockResponse = {
  code: "005930",
  corporationCode: "00126380",
  name: "삼성전자",
  marketType: "KOSPI",
  stockType: "보통주",
  status: "ACTIVE",
  listDd: "1975-06-11",
  createdAt: "2026-07-30T17:49:28.993831+09:00",
  updatedAt: "2026-07-30T17:49:28.993831+09:00",
} as const;

describe("krStockSchema", () => {
  it("parval과 listShrs가 누락된 이전 응답을 null로 정규화한다", () => {
    expect(krStockSchema.parse(krStockResponse)).toMatchObject({
      parval: null,
      listShrs: null,
    });
  });

  it("parval과 listShrs를 새 응답에서 검증한다", () => {
    expect(
      krStockSchema.parse({
        ...krStockResponse,
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
      krStockSchema.parse({
        ...krStockResponse,
        stockType: undefined,
      }),
    ).toThrow();
    expect(
      krStockSchema.parse({
        ...krStockResponse,
        stockType: " 보통주 ",
      }).stockType,
    ).toBe("보통주");
  });

  it.each(["ACTIVE", "LISTING_SCHEDULED", "DELISTED", "SUSPENDED"] as const)(
    "종목 상태 %s를 허용한다",
    (status) => {
      expect(
        krStockSchema.parse({
          ...krStockResponse,
          status,
        }).status,
      ).toBe(status);
    },
  );

  it("지원하지 않는 종목 상태를 거부한다", () => {
    expect(() =>
      krStockSchema.parse({
        ...krStockResponse,
        status: "NORMAL",
      }),
    ).toThrow();
  });

  it("KRX 전체 종목 동기화 결과를 검증한다", () => {
    expect(
      krStockSyncResultSchema.parse({
        fetchedCount: 2_785,
        updatedCount: 12,
      }),
    ).toEqual({
      fetchedCount: 2_785,
      updatedCount: 12,
    });
  });

  it.each(["Y", "K"] as const)(
    "생성·갱신 요청의 대체 시장 %s를 허용한다",
    (corporationClass) => {
      const payload = {
        corporationClass,
        corporationCode: "00126380",
        status: "ACTIVE" as const,
        stockCode: "005930",
      };

      expect(krStockUpsertPayloadSchema.parse(payload)).toEqual(payload);
    },
  );

  it("생성·갱신 요청에서 지원하지 않는 대체 시장을 거부한다", () => {
    expect(() =>
      krStockUpsertPayloadSchema.parse({
        corporationClass: "N",
        corporationCode: "00126380",
        status: "ACTIVE",
        stockCode: "005930",
      }),
    ).toThrow();
  });

  it("생성·갱신 요청의 선택적 대체 상장일을 YYYY-MM-DD 형식으로 검증한다", () => {
    const payload = {
      corporationCode: "00126380",
      listDd: "1975-06-11",
      status: "ACTIVE" as const,
      stockCode: "005930",
    };

    expect(krStockUpsertPayloadSchema.parse(payload)).toEqual(payload);
    expect(() =>
      krStockUpsertPayloadSchema.parse({
        ...payload,
        listDd: "19750611",
      }),
    ).toThrow();
  });

  it("생성·갱신 요청에서 종목 상태를 필수로 검증한다", () => {
    expect(() =>
      krStockUpsertPayloadSchema.parse({
        corporationCode: "00126380",
        stockCode: "005930",
      }),
    ).toThrow();
  });
});
