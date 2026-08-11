import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";

import { krCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";
import { KrCalendarEarningsPage } from "@/features/calendar-earnings/components/kr-calendar-earnings-page";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
  queryClient.setQueryData(krCalendarEarningsQueryOptions.queryKey, [
    {
      code: "001740",
      name: "SK네트웍스",
      marketType: "KOSPI",
      marketCap: null,
      reportDate: "2026-08-14",
      reportTime: "14:00",
    },
    {
      code: "294570",
      name: "쿠콘",
      marketType: "KOSDAQ",
      marketCap: null,
      reportDate: "2026-08-20",
      reportTime: null,
    },
  ]);

  render(
    <QueryClientProvider client={queryClient}>
      <KrCalendarEarningsPage />
    </QueryClientProvider>,
  );
}

describe("KrCalendarEarningsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("KR 실적 일정을 표시하고 시장으로 검색한다", async () => {
    renderPage();

    expect(screen.getByText("SK네트웍스")).toBeInTheDocument();
    expect(screen.getByText("쿠콘")).toBeInTheDocument();
    expect(screen.getByText("KOSPI")).toBeInTheDocument();
    expect(screen.getByText("KOSDAQ")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "KR 실적 일정 검색" }),
      { target: { value: "KOSDAQ" } },
    );

    await waitFor(() => {
      expect(screen.queryByText("SK네트웍스")).not.toBeInTheDocument();
    });
    expect(screen.getByText("쿠콘")).toBeInTheDocument();
  });
});
