import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

import { TooltipProvider } from "@/components/ui/tooltip";
import { krMarketDataPageLimit } from "@/data-access/queries/kr-market-data/queries";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { KrMarketDataPage } from "@/features/kr-market-data/components/kr-market-data-page";
import { getCurrentLocalDate } from "@/features/kr-market-data/kr-market-data-date";

const stock: KrStock = {
  code: "005930",
  corporationCode: "00126380",
  name: "삼성전자",
  marketType: "KOSPI",
  stockType: "보통주",
  listDd: "1975-06-11",
  parval: 100,
  listShrs: 5_969_782_550,
  createdAt: "2026-08-10T10:00:00+09:00",
  updatedAt: "2026-08-10T10:00:00+09:00",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
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
  queryClient.setQueryData(krStocksQueryOptions.queryKey, [stock]);

  render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <KrMarketDataPage />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("KrMarketDataPage", () => {
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

  it("종목과 주기를 선택하면 현재 일자 기준 KR 캔들을 조회한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          period: "weekly",
          date: "2026-08-10",
          open: 70_000,
          low: 69_500,
          high: 71_000,
          close: 70_500,
          priceChange: 500,
          volume: 12_345_678,
          value: 870_000_000_000,
        },
      ]),
    );
    renderPage();

    fireEvent.click(screen.getByRole("combobox", { name: "KR 종목" }));
    fireEvent.click(screen.getByRole("option", { name: /삼성전자/ }));
    fireEvent.keyDown(screen.getByRole("combobox", { name: "캔들 주기" }), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByRole("option", { name: "주봉" }));
    expect(screen.queryByLabelText("시작일")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("종료일")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => {
      expect(screen.getByText("70,500")).toBeInTheDocument();
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `/admin/kr-stocks/005930/market-data?period=weekly&end=${getCurrentLocalDate()}&limit=${krMarketDataPageLimit}`,
    );
    expect(screen.getByText("870,000,000,000")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "전일대비" }),
    ).toBeInTheDocument();
    expect(screen.getByText("+500")).toBeInTheDocument();
  });

  it("일봉 전용 저장 화면을 연다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "일봉 저장" }));

    const dialog = screen.getByRole("dialog", { name: "KR 일봉 저장" });

    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).queryByLabelText("캔들 주기"),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("시작일")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("종료일")).toBeInTheDocument();
    expect(within(dialog).getByText(/보정주가 일봉/)).toBeInTheDocument();
  });
});
