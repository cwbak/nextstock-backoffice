import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  CalendarEarningsTable,
  type CalendarEarningsTableItem,
} from "@/features/calendar-earnings/components/calendar-earnings-table";

const items: ReadonlyArray<CalendarEarningsTableItem> = [
  {
    identifier: "ACIU",
    name: "AC Immune SA",
    marketCap: null,
    classification: "-",
    reportDate: "2026-08-04",
    reportTime: null,
  },
  {
    identifier: "ACAD",
    name: "Acadia Pharmaceuticals Inc",
    marketCap: "1945000000.00",
    classification: "편입",
    reportDate: "2026-08-05",
    reportTime: "22:30",
  },
];

describe("CalendarEarningsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("종목명, 시가총액, S&P 500 편입 여부, 발표일과 nullable 발표 시간을 표시한다", () => {
    render(
      <CalendarEarningsTable classificationLabel="S&P 500" items={items} />,
    );

    expect(screen.getByText("ACIU")).toBeInTheDocument();
    expect(screen.getByText("AC Immune SA")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
    expect(screen.getByText("미정")).toBeInTheDocument();
    expect(screen.getByText("ACAD")).toBeInTheDocument();
    expect(screen.getByText("Acadia Pharmaceuticals Inc")).toBeInTheDocument();
    expect(screen.getByText("$1,945,000,000.00")).toBeInTheDocument();
    expect(screen.getByText("편입")).toBeInTheDocument();
    expect(screen.getByText("22:30")).toBeInTheDocument();
  });
});
