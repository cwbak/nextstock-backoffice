import { describe, expect, it } from "vitest";

import {
  calendarEarningSchema,
  createNasdaqCalendarEarningsResultSchema,
} from "@/data-access/schemas/calendar-earning";

const response = {
  symbol: "ACIU",
  name: "AC Immune SA",
  marketCap: null,
  isSp500: false,
  reportDate: "2026-08-04",
  reportTime: null,
} as const;

describe("calendar earning schemas", () => {
  it("발표 시간이 미정인 실적 일정을 검증한다", () => {
    expect(calendarEarningSchema.parse(response)).toEqual(response);
  });

  it("발표 시간이 지정된 실적 일정을 검증한다", () => {
    expect(
      calendarEarningSchema.parse({
        ...response,
        marketCap: "1945000000.00",
        reportTime: "22:30",
      }),
    ).toMatchObject({
      marketCap: "1945000000.00",
      reportTime: "22:30",
    });
  });

  it("NASDAQ 실적 일정 추가 결과를 검증한다", () => {
    const result = {
      fetchedCount: 1_200,
      insertedCount: 350,
      skippedCount: 850,
    };

    expect(createNasdaqCalendarEarningsResultSchema.parse(result)).toEqual(
      result,
    );
  });
});
