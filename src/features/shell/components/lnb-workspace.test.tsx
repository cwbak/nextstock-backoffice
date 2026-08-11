import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  usCalendarEarningsQueryOptions,
  krCalendarEarningsQueryOptions,
} from "@/data-access/queries/calendar-earnings/queries";
import { calendarEventsQueryOptions } from "@/data-access/queries/calendar-events/queries";
import { equityInvestmentsQueryOptions } from "@/data-access/queries/equity-investments/queries";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import { usStocksQueryOptions } from "@/data-access/queries/us-stocks/queries";
import {
  themesQueryOptions,
  themeStocksQueryOptions,
} from "@/data-access/queries/themes/queries";
import { routeTree } from "@/routeTree.gen";
const theme = {
  id: 449,
  parentThemeId: null,
  name: "2차전지(생산)",
  createdAt: "2026-08-09T10:00:00+09:00",
  updatedAt: "2026-08-09T10:00:00+09:00",
} as const;

function renderWorkspace() {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });

  queryClient.setQueryData(corporationsQueryOptions.queryKey, []);
  queryClient.setQueryData(equityInvestmentsQueryOptions.queryKey, []);
  queryClient.setQueryData(krStocksQueryOptions.queryKey, []);
  queryClient.setQueryData(usStocksQueryOptions.queryKey, []);
  queryClient.setQueryData(calendarEventsQueryOptions.queryKey, []);
  queryClient.setQueryData(usCalendarEarningsQueryOptions.queryKey, []);
  queryClient.setQueryData(krCalendarEarningsQueryOptions.queryKey, []);
  queryClient.setQueryData(themesQueryOptions.queryKey, [theme]);
  queryClient.setQueryData(themeStocksQueryOptions(theme.id).queryKey, []);

  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({
      initialEntries: ["/corporations"],
    }),
    routeTree,
  });

  render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>,
  );

  return router;
}

describe("LnbWorkspace", () => {
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
    vi.restoreAllMocks();
  });

  it("LNB를 왕복해도 각 페이지의 입력 중 상태를 유지한다", async () => {
    renderWorkspace();
    const corporationsInput = await screen.findByRole("searchbox", {
      name: "법인 검색",
    });

    fireEvent.compositionStart(corporationsInput);
    fireEvent.change(corporationsInput, { target: { value: "삼성" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "US 종목 정보",
      }),
    );

    const usStockInput = await screen.findByRole("searchbox", {
      name: "US 종목 정보 검색",
    });

    fireEvent.change(usStockInput, { target: { value: "Apple" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "출자현황",
      }),
    );

    const investmentsInput = await screen.findByRole("searchbox", {
      name: "출자현황 검색",
    });

    fireEvent.compositionStart(investmentsInput);
    fireEvent.change(investmentsInput, { target: { value: "전자" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "주식",
      }),
    );

    const krStocksInput = await screen.findByRole("searchbox", {
      name: "KR 종목 검색",
    });

    fireEvent.compositionStart(krStocksInput);
    fireEvent.change(krStocksInput, { target: { value: "현대" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "KR 캔들",
      }),
    );

    const krMarketDataPeriodSelect = screen.getByRole("combobox", {
      name: "캔들 주기",
    });

    fireEvent.keyDown(krMarketDataPeriodSelect, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "주봉" }));
    fireEvent.click(
      screen.getByRole("link", {
        name: "테마 리스팅",
      }),
    );

    const themeInput = await screen.findByRole("searchbox", {
      name: "테마 검색",
    });

    fireEvent.change(themeInput, { target: { value: "2차전지" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "일정",
      }),
    );

    const calendarEventsInput = await screen.findByRole("searchbox", {
      name: "일정 검색",
    });

    fireEvent.change(calendarEventsInput, { target: { value: "경제지표" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "실적(US)",
      }),
    );

    const calendarEarningsInput = await screen.findByRole("searchbox", {
      name: "US 실적 일정 검색",
    });

    fireEvent.change(calendarEarningsInput, { target: { value: "ACIU" } });

    fireEvent.click(
      screen.getByRole("link", {
        name: "실적(KR)",
      }),
    );

    const krCalendarEarningsInput = await screen.findByRole("searchbox", {
      name: "KR 실적 일정 검색",
    });

    fireEvent.change(krCalendarEarningsInput, { target: { value: "삼성" } });
    fireEvent.click(
      screen.getByRole("link", {
        name: "법인",
      }),
    );

    await waitFor(() => expect(corporationsInput).toBeVisible());
    expect(corporationsInput).toHaveValue("삼성");

    fireEvent.click(
      screen.getByRole("link", {
        name: "출자현황",
      }),
    );

    await waitFor(() => expect(investmentsInput).toBeVisible());
    expect(investmentsInput).toHaveValue("전자");

    fireEvent.click(
      screen.getByRole("link", {
        name: "주식",
      }),
    );

    await waitFor(() => expect(krStocksInput).toBeVisible());
    expect(krStocksInput).toHaveValue("현대");

    fireEvent.click(
      screen.getByRole("link", {
        name: "KR 캔들",
      }),
    );

    await waitFor(() => expect(krMarketDataPeriodSelect).toBeVisible());
    expect(krMarketDataPeriodSelect).toHaveTextContent("주봉");

    fireEvent.click(
      screen.getByRole("link", {
        name: "테마 리스팅",
      }),
    );

    await waitFor(() => expect(themeInput).toBeVisible());
    expect(themeInput).toHaveValue("2차전지");

    fireEvent.click(
      screen.getByRole("link", {
        name: "일정",
      }),
    );

    await waitFor(() => expect(calendarEventsInput).toBeVisible());
    expect(calendarEventsInput).toHaveValue("경제지표");

    fireEvent.click(
      screen.getByRole("link", {
        name: "실적(US)",
      }),
    );

    await waitFor(() => expect(calendarEarningsInput).toBeVisible());
    expect(calendarEarningsInput).toHaveValue("ACIU");

    fireEvent.click(
      screen.getByRole("link", {
        name: "실적(KR)",
      }),
    );

    await waitFor(() => expect(krCalendarEarningsInput).toBeVisible());
    expect(krCalendarEarningsInput).toHaveValue("삼성");

    fireEvent.click(
      screen.getByRole("link", {
        name: "US 종목 정보",
      }),
    );

    await waitFor(() => expect(usStockInput).toBeVisible());
    expect(usStockInput).toHaveValue("Apple");
  });

  it("검색 상태는 유지하면서 URL에는 현재 메뉴 경로만 표시한다", async () => {
    const router = renderWorkspace();
    const corporationsInput = await screen.findByRole("searchbox", {
      name: "법인 검색",
    });

    fireEvent.change(corporationsInput, { target: { value: "삼성" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/corporations");

    fireEvent.click(
      screen.getByRole("link", {
        name: "US 종목 정보",
      }),
    );

    const usStockInput = await screen.findByRole("searchbox", {
      name: "US 종목 정보 검색",
    });

    fireEvent.change(usStockInput, { target: { value: "NVDA" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/us-stocks");

    fireEvent.click(
      screen.getByRole("link", {
        name: "법인",
      }),
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "출자현황",
      }),
    );

    const investmentsInput = await screen.findByRole("searchbox", {
      name: "출자현황 검색",
    });

    fireEvent.change(investmentsInput, { target: { value: "지분" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/corporation-investments");

    fireEvent.click(
      screen.getByRole("link", {
        name: "주식",
      }),
    );

    const krStocksInput = await screen.findByRole("searchbox", {
      name: "KR 종목 검색",
    });

    fireEvent.change(krStocksInput, { target: { value: "현대" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/listed-stocks");

    fireEvent.click(
      screen.getByRole("link", {
        name: "테마 리스팅",
      }),
    );

    const themeInput = await screen.findByRole("searchbox", {
      name: "테마 검색",
    });

    fireEvent.change(themeInput, { target: { value: "2차전지" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/themes");

    fireEvent.click(
      screen.getByRole("link", {
        name: "일정",
      }),
    );

    const calendarEventsInput = await screen.findByRole("searchbox", {
      name: "일정 검색",
    });

    fireEvent.change(calendarEventsInput, { target: { value: "실적" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/calendar-events");

    fireEvent.click(
      screen.getByRole("link", {
        name: "실적(US)",
      }),
    );

    const calendarEarningsInput = await screen.findByRole("searchbox", {
      name: "US 실적 일정 검색",
    });

    fireEvent.change(calendarEarningsInput, { target: { value: "AAPL" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/calendar-earnings-us");

    fireEvent.click(
      screen.getByRole("link", {
        name: "법인",
      }),
    );

    await waitFor(() => expect(corporationsInput).toBeVisible());
    expect(corporationsInput).toHaveValue("삼성");
    expect(router.state.location.href).toBe("/corporations");
  });
});
