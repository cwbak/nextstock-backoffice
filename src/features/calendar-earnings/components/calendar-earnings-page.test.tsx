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
  symbol: string,
  name: string,
  marketCap: string | null,
  isSp500: boolean,
): CalendarEarning {
  return {
    symbol,
    name,
    marketCap,
    isSp500,
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
    createItem("MEGA", "Mega Earnings", "250000000000.00", true),
    createItem("LARGE", "Large Earnings", "10000000000.00", false),
    createItem("SMALL", "Small Earnings", "1000000000.00", true),
    createItem("UNKNOWN", "Unknown Earnings", null, false),
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

  it("시가총액과 S&P 500 조건을 AND로 적용한다", async () => {
    renderPage();

    const marketCapFilter = screen.getByRole("combobox", {
      name: "시가총액 필터",
    });
    const sp500Filter = screen.getByRole("combobox", {
      name: "S&P 500 필터",
    });

    fireEvent.keyDown(marketCapFilter, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "$10B 이상" }));

    expect(screen.getByText("Mega Earnings")).toBeInTheDocument();
    expect(screen.getByText("Large Earnings")).toBeInTheDocument();
    expect(screen.queryByText("Small Earnings")).not.toBeInTheDocument();

    fireEvent.keyDown(sp500Filter, { key: "ArrowDown" });
    fireEvent.click(
      await screen.findByRole("option", { name: "S&P 500 편입" }),
    );

    expect(marketCapFilter).toHaveTextContent("$10B 이상");
    expect(sp500Filter).toHaveTextContent("S&P 500 편입");
    expect(screen.getByText("Mega Earnings")).toBeInTheDocument();
    expect(screen.queryByText("Large Earnings")).not.toBeInTheDocument();
    expect(screen.queryByText("Small Earnings")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown Earnings")).not.toBeInTheDocument();
  });
});
