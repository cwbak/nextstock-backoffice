import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/data-access/schemas/calendar-event";
import { CalendarEventsTable } from "@/features/calendar-events/components/calendar-events-table";

const items: ReadonlyArray<CalendarEvent> = [
  {
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
    updatedAt: "2026-08-05T11:00:00+09:00",
  },
  {
    id: 2,
    eventDate: "2026-08-03",
    countryCode: "US",
    eventType: "EARNINGS",
    title: "애플 실적 발표",
    titleEn: null,
    eventTime: "16:30",
    timezone: "America/New_York",
    importance: "high",
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
  },
];

describe("CalendarEventsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("일정 유형, 중요도, 종일 및 시간대 정보를 표시한다", () => {
    render(<CalendarEventsTable items={items} />);

    expect(screen.getByText("OPEC-JMMC 회의")).toBeInTheDocument();
    expect(screen.getByText("OPEC-JMMC Meetings")).toBeInTheDocument();
    expect(screen.getByText("경제지표")).toBeInTheDocument();
    expect(screen.getByText("종일")).toBeInTheDocument();
    expect(screen.getByText("보통")).toBeInTheDocument();
    expect(screen.getByText("애플 실적 발표")).toBeInTheDocument();
    expect(screen.getByText("실적")).toBeInTheDocument();
    expect(screen.getByText("16:30")).toBeInTheDocument();
    expect(screen.getByText("America/New_York")).toBeInTheDocument();
    expect(screen.getByText("높음")).toBeInTheDocument();
  });
});
