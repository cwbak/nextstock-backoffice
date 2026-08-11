import { describe, expect, it } from "vitest";

import {
  krxMarketDataCreatePayloadSchema,
  krxMarketDataCreateResultSchema,
  krxMarketDataListParamsSchema,
  krxMarketDataSchema,
} from "@/data-access/schemas/krx-market-data";

const dailyPrice = {
  date: "2026-08-10",
  open: 70_000,
  low: 69_500,
  high: 71_000,
  close: 70_500,
  volume: 12_345_678,
  value: 870_000_000_000,
} as const;

describe("KRX market data schemas", () => {
  it("KRX 일봉 응답을 검증한다", () => {
    expect(krxMarketDataSchema.parse(dailyPrice)).toEqual(dailyPrice);
  });

  it("음수 가격은 거부한다", () => {
    expect(() =>
      krxMarketDataSchema.parse({ ...dailyPrice, close: -1 }),
    ).toThrow();
  });

  it("목록 조회 날짜는 한쪽만 지정할 수 있다", () => {
    expect(
      krxMarketDataListParamsSchema.parse({
        stockCode: "005930",
        from: "2026-01-01",
        to: "",
      }),
    ).toEqual({ stockCode: "005930", from: "2026-01-01", to: "" });
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
    ).toEqual({ fetchedCount: 145, insertedCount: 140 });
  });
});
