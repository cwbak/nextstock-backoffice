import { describe, expect, it } from "vitest";

import {
  krMarketDataCreateAllPayloadSchema,
  krMarketDataCreatePayloadSchema,
  krMarketDataCreateResultSchema,
  krMarketDataFilterSchema,
  krMarketDataKisDailyPayloadSchema,
  krMarketDataKisDailyResultSchema,
  krMarketDataListParamsSchema,
  krMarketDataSchema,
} from "@/data-access/schemas/kr-market-data";

const dailyPrice = {
  period: "daily",
  date: "2026-08-10",
  open: 70_000,
  low: 69_500,
  high: 71_000,
  close: 70_500,
  priceChange: 500,
  volume: 12_345_678,
  value: 870_000_000_000,
} as const;

describe("KR market data schemas", () => {
  it("주기가 포함된 KR 캔들 응답을 검증한다", () => {
    expect(krMarketDataSchema.parse(dailyPrice)).toEqual(dailyPrice);
  });

  it("음수 가격은 거부한다", () => {
    expect(() =>
      krMarketDataSchema.parse({ ...dailyPrice, close: -1 }),
    ).toThrow();
  });

  it("전일대비는 음수와 0을 허용한다", () => {
    expect(
      krMarketDataSchema.parse({ ...dailyPrice, priceChange: -500 })
        .priceChange,
    ).toBe(-500);
    expect(
      krMarketDataSchema.parse({ ...dailyPrice, priceChange: 0 }).priceChange,
    ).toBe(0);
  });

  it("지원하지 않는 캔들 주기는 거부한다", () => {
    expect(() =>
      krMarketDataSchema.parse({ ...dailyPrice, period: "yearly" }),
    ).toThrow("캔들 주기는 일봉, 주봉, 월봉 중에서 선택해 주세요.");
  });

  it("조회 필터와 현재 일자 기반 페이지 조건을 검증한다", () => {
    expect(
      krMarketDataFilterSchema.parse({
        stockCode: "005930",
        period: "weekly",
      }),
    ).toEqual({
      stockCode: "005930",
      period: "weekly",
    });
    expect(
      krMarketDataListParamsSchema.parse({
        stockCode: "005930",
        period: "weekly",
        end: "2026-08-11",
        limit: 100,
      }),
    ).toEqual({
      stockCode: "005930",
      period: "weekly",
      end: "2026-08-11",
      limit: 100,
    });
  });

  it("목록 조회 limit이 API 상한을 넘으면 거부한다", () => {
    expect(() =>
      krMarketDataListParamsSchema.parse({
        stockCode: "005930",
        period: "daily",
        end: "2026-08-11",
        limit: 1_001,
      }),
    ).toThrow();
  });

  it("저장 날짜가 역순이면 거부한다", () => {
    expect(() =>
      krMarketDataCreatePayloadSchema.parse({
        adjusted: true,
        stockCode: "005930",
        from: "2026-08-11",
        to: "2026-08-10",
      }),
    ).toThrow("종료일은 시작일보다 빠를 수 없습니다.");
  });

  it("KIS 저장 요청의 수정주가 여부를 검증한다", () => {
    expect(
      krMarketDataCreatePayloadSchema.parse({
        adjusted: true,
        stockCode: "005930",
        from: "2026-08-01",
        to: "2026-08-10",
      }),
    ).toEqual({
      adjusted: true,
      stockCode: "005930",
      from: "2026-08-01",
      to: "2026-08-10",
    });
    expect(
      krMarketDataKisDailyPayloadSchema.parse({
        adjusted: false,
        from: "2026-08-01",
        to: "2026-08-10",
      }),
    ).toEqual({
      adjusted: false,
      from: "2026-08-01",
      to: "2026-08-10",
    });
  });

  it("전체 종목 저장 날짜 구간을 검증한다", () => {
    expect(
      krMarketDataCreateAllPayloadSchema.parse({
        from: "2026-08-01",
        to: "2026-08-10",
      }),
    ).toEqual({
      from: "2026-08-01",
      to: "2026-08-10",
    });
    expect(() =>
      krMarketDataCreateAllPayloadSchema.parse({
        from: "2026-08-11",
        to: "2026-08-10",
      }),
    ).toThrow("종료일은 시작일보다 빠를 수 없습니다.");
  });

  it("저장 결과 건수를 검증한다", () => {
    expect(
      krMarketDataCreateResultSchema.parse({
        fetchedCount: 145,
        insertedCount: 140,
      }),
    ).toEqual({
      fetchedCount: 145,
      insertedCount: 140,
    });
  });

  it("KIS 전 종목 일봉 작업 결과를 검증한다", () => {
    const result = {
      from: "2026-01-01",
      to: "2026-08-10",
      stockCount: 2_800,
      processedCount: 2_798,
      failedCount: 2,
      fetchedCount: 420_000,
      insertedCount: 420_000,
    };

    expect(krMarketDataKisDailyResultSchema.parse(result)).toEqual(result);
  });
});
