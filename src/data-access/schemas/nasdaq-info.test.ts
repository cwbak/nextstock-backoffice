import { describe, expect, it } from "vitest";

import {
  nasdaqInfoSchema,
  nasdaqInfoUploadResultSchema,
} from "@/data-access/schemas/nasdaq-info";

const response = {
  symbol: "A",
  name: "Agilent Technologies Inc. Common Stock",
  marketCap: "39314526605.00",
  country: "United States",
  ipoYear: 1999,
  sector: "Industrials",
  industry: "Biotechnology: Laboratory Analytical Instruments",
  isSp500: true,
  createdAt: "2026-08-05T10:00:00+09:00",
  updatedAt: "2026-08-05T10:00:00+09:00",
} as const;

describe("nasdaq info schemas", () => {
  it("NASDAQ 종목 정보 응답을 검증한다", () => {
    expect(nasdaqInfoSchema.parse(response)).toEqual(response);
  });

  it("선택 정보의 null을 허용한다", () => {
    expect(
      nasdaqInfoSchema.parse({
        ...response,
        marketCap: null,
        country: null,
        ipoYear: null,
        sector: null,
        industry: null,
      }),
    ).toMatchObject({
      marketCap: null,
      country: null,
      ipoYear: null,
      sector: null,
      industry: null,
    });
  });

  it("CSV 반영 결과 건수를 검증한다", () => {
    expect(
      nasdaqInfoUploadResultSchema.parse({
        processedCount: 20,
        upsertedCount: 12,
      }),
    ).toEqual({ processedCount: 20, upsertedCount: 12 });
  });
});
