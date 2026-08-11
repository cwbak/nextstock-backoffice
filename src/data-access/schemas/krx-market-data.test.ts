import { describe, expect, it } from "vitest";

import {
  krxMarketDataCreatePayloadSchema,
  krxMarketDataCreateResultSchema,
  krxMarketDataFilterSchema,
  krxMarketDataListParamsSchema,
  krxMarketDataSchema,
} from "@/data-access/schemas/krx-market-data";

const dailyPrice = {
  period: "daily",
  date: "2026-08-10",
  open: 70_000,
  low: 69_500,
  high: 71_000,
  close: 70_500,
  volume: 12_345_678,
  value: 870_000_000_000,
} as const;

describe("KRX market data schemas", () => {
  it("주기가 포함된 KRX 캔들 응답을 검증한다", () => {
    expect(krxMarketDataSchema.parse(dailyPrice)).toEqual(dailyPrice);
  });

  it("음수 가격은 거부한다", () => {
    expect(() =>
      krxMarketDataSchema.parse({ ...dailyPrice, close: -1 }),
    ).toThrow();
  });

  it("지원하지 않는 캔들 주기는 거부한다", () => {
    expect(() =>
      krxMarketDataSchema.parse({ ...dailyPrice, period: "yearly" }),
    ).toThrow("캔들 주기는 일봉, 주봉, 월봉 중에서 선택해 주세요.");
  });

  it("조회 필터와 현재 일자 기반 페이지 조건을 검증한다", () => {
    expect(
      krxMarketDataFilterSchema.parse({
        stockCode: "005930",
        period: "weekly",
      }),
    ).toEqual({
      stockCode: "005930",
      period: "weekly",
    });
    expect(
      krxMarketDataListParamsSchema.parse({
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
      krxMarketDataListParamsSchema.parse({
        stockCode: "005930",
        period: "daily",
        end: "2026-08-11",
        limit: 1_001,
      }),
    ).toThrow();
  });

  it("저장 날짜가 역순이면 거부한다", () => {
    expect(() =>
      krxMarketDataCreatePayloadSchema.parse({
        stockCode: "005930",
        from: "2026-08-11",
        to: "2026-08-10",
      }),
    ).toThrow("종료일은 시작일보다 빠를 수 없습니다.");
  });

  it("저장 결과 건수를 검증한다", () => {
    expect(
      krxMarketDataCreateResultSchema.parse({
        fetchedCount: 145,
        insertedCount: 140,
      }),
    ).toEqual({
      fetchedCount: 145,
      insertedCount: 140,
    });
  });
});
