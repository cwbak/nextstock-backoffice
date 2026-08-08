import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CalendarEarning } from "@/data-access/schemas/calendar-earning";
import { CalendarEarningsTable } from "@/features/calendar-earnings/components/calendar-earnings-table";

const items: ReadonlyArray<CalendarEarning> = [
  {
    key: "ACIU",
    stockType: "NASDAQ",
    name: "AC Immune SA",
    marketCap: null,
    reportDate: "2026-08-04",
    reportTime: null,
  },
  {
    key: "005930",
    stockType: "KOSPI",
    name: "삼성전자",
    marketCap: "1945000000.00",
    reportDate: "2026-08-05",
    reportTime: "22:30",
  },
];

describe("CalendarEarningsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("종목명, 시가총액, 시장, 발표일과 nullable 발표 시간을 표시한다", () => {
    render(<CalendarEarningsTable items={items} />);

    expect(screen.getByText("ACIU")).toBeInTheDocument();
    expect(screen.getByText("AC Immune SA")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("NASDAQ")).toBeInTheDocument();
    expect(screen.getByText("미정")).toBeInTheDocument();
    expect(screen.getByText("005930")).toBeInTheDocument();
    expect(screen.getByText("삼성전자")).toBeInTheDocument();
    expect(screen.getByText("$1,945,000,000.00")).toBeInTheDocument();
    expect(screen.getByText("KOSPI")).toBeInTheDocument();
    expect(screen.getByText("22:30")).toBeInTheDocument();
  });
});
