import { describe, expect, it } from "vitest";

import { calendarEventSchema } from "@/data-access/schemas/calendar-event";

const response = {
  id: 1,
  eventDate: "2026-08-02",
  countryCode: "XX",
  eventType: "INDICATOR",
  title: "OPEC-JMMC 회의",
  titleEn: "OPEC-JMMC Meetings",
  eventTime: null,
  timezone: null,
  importance: "medium",
  createdAt: "2026-08-05T10:00:00+09:00",
  updatedAt: "2026-08-05T10:00:00+09:00",
} as const;

describe("calendar event schema", () => {
  it("캘린더 일정 응답을 검증한다", () => {
    expect(calendarEventSchema.parse(response)).toEqual(response);
  });

  it("시간이 지정된 일정을 검증한다", () => {
    expect(
      calendarEventSchema.parse({
        ...response,
        eventTime: "15:30",
        timezone: "Asia/Seoul",
      }),
    ).toMatchObject({
      eventTime: "15:30",
      timezone: "Asia/Seoul",
    });
  });

  it("명세에 없는 일정 유형을 거부한다", () => {
    expect(() =>
      calendarEventSchema.parse({
        ...response,
        eventType: "HOLIDAY",
      }),
    ).toThrow();
  });
});
