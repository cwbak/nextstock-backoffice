import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
import { krxStocksQueryOptions } from "@/data-access/queries/krx-stocks/queries";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import { KrxMarketDataPage } from "@/features/krx-market-data/components/krx-market-data-page";

const stock: KrxStock = {
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
  queryClient.setQueryData(krxStocksQueryOptions.queryKey, [stock]);

  render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <KrxMarketDataPage />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("KrxMarketDataPage", () => {
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

  it("종목, 주기와 기간을 선택해 KRX 캔들을 조회한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          period: "weekly",
          date: "2026-08-10",
          open: 70_000,
          low: 69_500,
          high: 71_000,
          close: 70_500,
          volume: 12_345_678,
          value: 870_000_000_000,
        },
      ]),
    );
    renderPage();

    fireEvent.click(screen.getByRole("combobox", { name: "KRX 종목" }));
    fireEvent.click(screen.getByRole("option", { name: /삼성전자/ }));
    fireEvent.keyDown(screen.getByRole("combobox", { name: "캔들 주기" }), {
      key: "ArrowDown",
    });
    fireEvent.click(await screen.findByRole("option", { name: "주봉" }));
    fireEvent.change(screen.getByLabelText("시작일"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("종료일"), {
      target: { value: "2026-08-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => {
      expect(screen.getByText("70,500")).toBeInTheDocument();
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/krx-stocks/005930/market-data?period=weekly&from=2026-01-01&to=2026-08-10",
    );
    expect(screen.getByText("870,000,000,000")).toBeInTheDocument();
  });

  it("캔들 저장 화면을 연다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "캔들 저장" }));

    expect(
      screen.getByRole("dialog", { name: "KRX 캔들 저장" }),
    ).toBeInTheDocument();
  });
});
