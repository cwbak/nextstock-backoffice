import { describe, expect, it } from "vitest";

import { krCalendarEarningSchema } from "@/data-access/schemas/kr-calendar-earning";

const response = {
  code: "001740",
  name: "SK네트웍스",
  marketType: "KOSPI",
  marketCap: null,
  reportDate: "2026-08-14",
  reportTime: "14:00",
} as const;

describe("kr calendar earning schemas", () => {
  it("KR 실적 일정 응답을 검증한다", () => {
    expect(krCalendarEarningSchema.parse(response)).toEqual(response);
  });

  it("KOSDAQ과 미정 발표 시간을 허용한다", () => {
    expect(
      krCalendarEarningSchema.parse({
        ...response,
        marketType: "KOSDAQ",
        reportTime: null,
      }),
    ).toMatchObject({ marketType: "KOSDAQ", reportTime: null });
  });

  it("명세와 달리 시가총액이 값으로 오면 거부한다", () => {
    expect(
      krCalendarEarningSchema.safeParse({
        ...response,
        marketCap: "1000000.00",
      }).success,
    ).toBe(false);
  });
});
