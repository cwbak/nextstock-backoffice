import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { calendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";
import type { CalendarEarning } from "@/data-access/schemas/calendar-earning";
import { CalendarEarningsPage } from "@/features/calendar-earnings/components/calendar-earnings-page";

function createItem(
  key: string,
  name: string,
  marketCap: string | null,
): CalendarEarning {
  return {
    key,
    name,
    marketCap,
    stockType: "NASDAQ",
    reportDate: "2026-08-20",
    reportTime: null,
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
  queryClient.setQueryData(calendarEarningsQueryOptions.queryKey, [
    createItem("MEGA", "Mega Earnings", "250000000000.00"),
    createItem("LARGE", "Large Earnings", "10000000000.00"),
    createItem("UNKNOWN", "Unknown Earnings", null),
  ]);

  render(
    <QueryClientProvider client={queryClient}>
      <CalendarEarningsPage />
    </QueryClientProvider>,
  );
}

describe("CalendarEarningsPage", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterAll(() => {
    delete (
      HTMLElement.prototype as Partial<Pick<HTMLElement, "scrollIntoView">>
    ).scrollIntoView;
  });

  afterEach(() => {
    cleanup();
  });

  it("선택한 시가총액 하한 이상인 실적 일정만 표시한다", async () => {
    renderPage();

    const filter = screen.getByRole("combobox", { name: "시가총액 필터" });
    expect(filter).toHaveTextContent("전체");
    expect(screen.getByText("Mega Earnings")).toBeInTheDocument();
    expect(screen.getByText("Large Earnings")).toBeInTheDocument();
    expect(screen.getByText("Unknown Earnings")).toBeInTheDocument();

    fireEvent.keyDown(filter, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "$200B 이상" }));

    expect(filter).toHaveTextContent("$200B 이상");
    expect(screen.getByText("Mega Earnings")).toBeInTheDocument();
    expect(screen.queryByText("Large Earnings")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown Earnings")).not.toBeInTheDocument();
  });
});
