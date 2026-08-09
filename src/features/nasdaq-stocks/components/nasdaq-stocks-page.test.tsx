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

import { nasdaqStocksQueryOptions } from "@/data-access/queries/nasdaq-stocks/queries";
import type { NasdaqStock } from "@/data-access/schemas/nasdaq-stock";
import { NasdaqStocksPage } from "@/features/nasdaq-stocks/components/nasdaq-stocks-page";

function createItem(
  symbol: string,
  name: string,
  marketCap: string | null,
  isSp500: boolean,
): NasdaqStock {
  return {
    symbol,
    name,
    marketCap,
    country: null,
    ipoYear: null,
    sector: null,
    industry: null,
    isSp500,
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
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
  queryClient.setQueryData(nasdaqStocksQueryOptions.queryKey, [
    createItem("MEGA", "Mega Corp", "250000000000.00", true),
    createItem("LARGE", "Large Corp", "10000000000.00", false),
    createItem("SMALL", "Small Corp", "1000000000.00", true),
    createItem("UNKNOWN", "Unknown Corp", null, false),
  ]);

  render(
    <QueryClientProvider client={queryClient}>
      <NasdaqStocksPage />
    </QueryClientProvider>,
  );
}

describe("NasdaqStocksPage", () => {
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

  it("선택한 시가총액 하한 이상인 종목만 표시한다", async () => {
    renderPage();

    const filter = screen.getByRole("combobox", { name: "시가총액 필터" });
    expect(filter).toHaveTextContent("전체");
    expect(screen.getByText("Mega Corp")).toBeInTheDocument();
    expect(screen.getByText("Large Corp")).toBeInTheDocument();
    expect(screen.getByText("Unknown Corp")).toBeInTheDocument();

    fireEvent.keyDown(filter, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "$200B 이상" }));

    expect(filter).toHaveTextContent("$200B 이상");
    expect(screen.getByText("Mega Corp")).toBeInTheDocument();
    expect(screen.queryByText("Large Corp")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown Corp")).not.toBeInTheDocument();
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

    expect(screen.getByText("Mega Corp")).toBeInTheDocument();
    expect(screen.getByText("Large Corp")).toBeInTheDocument();
    expect(screen.queryByText("Small Corp")).not.toBeInTheDocument();

    fireEvent.keyDown(sp500Filter, { key: "ArrowDown" });
    fireEvent.click(
      await screen.findByRole("option", { name: "S&P 500 편입" }),
    );

    expect(marketCapFilter).toHaveTextContent("$10B 이상");
    expect(sp500Filter).toHaveTextContent("S&P 500 편입");
    expect(screen.getByText("Mega Corp")).toBeInTheDocument();
    expect(screen.queryByText("Large Corp")).not.toBeInTheDocument();
    expect(screen.queryByText("Small Corp")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown Corp")).not.toBeInTheDocument();
  });
});
