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
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
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
  status: "ACTIVE",
  listDd: "1975-06-11",
  parval: 100,
  listShrs: 5_969_782_550,
  createdAt: "2026-08-10T10:00:00+09:00",
  updatedAt: "2026-08-10T10:00:00+09:00",
};

const dongwhaPharmStock: KrStock = {
  ...stock,
  code: "000020",
  corporationCode: "00119195",
  name: "동화약품",
};

const fromBioStock: KrStock = {
  ...stock,
  code: "377220",
  corporationCode: "01505747",
  name: "프롬바이오",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function renderPage(stocks: ReadonlyArray<KrStock> = [stock]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
  queryClient.setQueryData(krStocksQueryOptions.queryKey, [...stocks]);

  render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <KrMarketDataPage />
      </TooltipProvider>
    </QueryClientProvider>,
  );

  return queryClient;
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
    fireEvent.click(screen.getByRole("combobox", { name: "주가 기준" }));
    fireEvent.click(await screen.findByRole("option", { name: "원본주가" }));
    expect(screen.queryByLabelText("시작일")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("종료일")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => {
      expect(screen.getByText("70,500")).toBeInTheDocument();
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `/admin/stocks/005930/market-data?period=weekly&end=${getCurrentLocalDate()}&limit=${krMarketDataPageLimit}&adjusted=false`,
    );
    expect(screen.getByText("870,000,000,000")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "전일대비" }),
    ).toBeInTheDocument();
    expect(screen.getByText("+500")).toBeInTheDocument();
  });

  it("수정주가 조회에서는 전일대비 컬럼을 표시하지 않는다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          period: "daily",
          date: "2026-08-10",
          open: 70_000,
          low: 69_500,
          high: 71_000,
          close: 70_500,
          priceChange: 0,
          volume: 12_345_678,
          value: 870_000_000_000,
        },
      ]),
    );
    renderPage();

    fireEvent.click(screen.getByRole("combobox", { name: "KR 종목" }));
    fireEvent.click(screen.getByRole("option", { name: /삼성전자/ }));
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => {
      expect(screen.getByText("70,500")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("columnheader", { name: "전일대비" }),
    ).not.toBeInTheDocument();
  });

  it("조회 종목을 바꾸면 새 종목 코드로 캔들을 요청한다", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse([]));
    renderPage([dongwhaPharmStock, fromBioStock]);

    fireEvent.click(screen.getByRole("combobox", { name: "KR 종목" }));
    fireEvent.click(screen.getByRole("option", { name: /동화약품/ }));
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `/admin/stocks/000020/market-data?period=daily&end=${getCurrentLocalDate()}&limit=${krMarketDataPageLimit}&adjusted=true`,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "KR 종목" }));
    const stockSearch = screen.getByRole("searchbox", {
      name: "KR 종목 검색",
    });
    fireEvent.change(stockSearch, { target: { value: "프롬바이오" } });
    fireEvent.keyDown(stockSearch, { isComposing: true, key: "Enter" });
    expect(screen.getByRole("combobox", { name: "KR 종목" })).toHaveTextContent(
      "000020 · 동화약품",
    );
    fireEvent.keyDown(stockSearch, { key: "Enter" });
    expect(screen.getByRole("combobox", { name: "KR 종목" })).toHaveTextContent(
      "377220 · 프롬바이오",
    );
    fireEvent.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `/admin/stocks/377220/market-data?period=daily&end=${getCurrentLocalDate()}&limit=${krMarketDataPageLimit}&adjusted=true`,
    );
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
    expect(within(dialog).getByLabelText("주가 기준")).toHaveTextContent(
      "수정주가",
    );
  });

  it("선택한 종목의 원본주가를 수정주가에 반영한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        copiedCount: 3,
        adjustedCount: 20,
      }),
    );
    const queryClient = renderPage();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.click(screen.getByRole("button", { name: "수정주가 반영" }));

    const dialog = screen.getByRole("dialog", { name: "KR 수정주가 반영" });

    fireEvent.click(within(dialog).getByRole("combobox", { name: "KR 종목" }));
    fireEvent.click(screen.getByRole("option", { name: /삼성전자/ }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: "수정주가 반영" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("005930 · 삼성전자 수정주가를 반영했습니다"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/원본주가에서 신규 3거래일/)).toBeInTheDocument();
    expect(screen.getByText(/실제로 달라진 캔들 20건/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/005930/market-data/adjust",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krMarketDataKeys.stock("005930"),
    });
  });

  it("KRX 일자별 전 종목 일봉 저장 화면을 연다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "KRX 일자별 저장" }));

    const dialog = screen.getByRole("dialog", {
      name: "KRX 일자별 전 종목 일봉 저장",
    });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("KR 종목")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("시작일")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("종료일")).toBeInTheDocument();
    expect(
      within(dialog).queryByLabelText("주가 기준"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText(/같은 종목·날짜가 있어도 새 버전/),
    ).toBeInTheDocument();
  });

  it("KIS 전 종목 기간 일봉 저장 화면을 연다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "KIS 전 종목 저장" }));

    const dialog = screen.getByRole("dialog", {
      name: "KIS 전 종목 기간 일봉 저장",
    });

    expect(within(dialog).getByLabelText("시작일")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("종료일")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("주가 기준")).toHaveTextContent(
      "수정주가",
    );
    expect(
      within(dialog).getByText(/Worker가 종목 코드순/),
    ).toBeInTheDocument();
  });
});
