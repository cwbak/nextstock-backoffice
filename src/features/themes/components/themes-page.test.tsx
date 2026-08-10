import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";

import { krxStocksQueryOptions } from "@/data-access/queries/krx-stocks/queries";
import {
  themesQueryOptions,
  themeStocksQueryOptions,
} from "@/data-access/queries/themes/queries";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import type { Theme } from "@/data-access/schemas/theme";
import { ThemesPage } from "@/features/themes/components/themes-page";

const rootTheme: Theme = {
  id: 449,
  parentThemeId: null,
  name: "2차전지(생산)",
  createdAt: "2026-08-09T10:00:00+09:00",
  updatedAt: "2026-08-09T10:00:00+09:00",
};

const childTheme: Theme = {
  ...rootTheme,
  id: 450,
  parentThemeId: rootTheme.id,
  name: "2차전지(소재)",
};

function createStock(code: string, name: string): KrxStock {
  return {
    code,
    corporationCode: "00126362",
    name,
    marketType: "KOSPI",
    stockType: "보통주",
    listDd: "1979-02-27",
    parval: 5_000,
    listShrs: 80_585_530,
    createdAt: "2026-08-09T10:00:00+09:00",
    updatedAt: "2026-08-09T10:00:00+09:00",
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
  queryClient.setQueryData(themesQueryOptions.queryKey, [
    rootTheme,
    childTheme,
  ]);
  queryClient.setQueryData(themeStocksQueryOptions(rootTheme.id).queryKey, [
    createStock("006400", "삼성SDI"),
  ]);
  queryClient.setQueryData(themeStocksQueryOptions(childTheme.id).queryKey, [
    createStock("005490", "POSCO홀딩스"),
  ]);
  queryClient.setQueryData(krxStocksQueryOptions.queryKey, [
    createStock("006400", "삼성SDI"),
    createStock("005930", "삼성전자"),
  ]);

  render(
    <QueryClientProvider client={queryClient}>
      <ThemesPage />
    </QueryClientProvider>,
  );
}

describe("ThemesPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("테마를 선택하면 연결된 KRX 종목을 표시한다", async () => {
    renderPage();

    expect(screen.getByText("삼성SDI")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: `${childTheme.name} 테마 선택`,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("POSCO홀딩스")).toBeInTheDocument();
    });
    expect(screen.queryByText("삼성SDI")).not.toBeInTheDocument();
    expect(
      screen.getByText(`상위 테마 · ${rootTheme.name}`),
    ).toBeInTheDocument();
  });

  it("테마명으로 목록을 검색한다", async () => {
    renderPage();

    fireEvent.change(screen.getByRole("searchbox", { name: "테마 검색" }), {
      target: { value: "소재" },
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: `${rootTheme.name} 테마 선택`,
        }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", {
        name: `${childTheme.name} 테마 선택`,
      }),
    ).toBeInTheDocument();
  });

  it("테마 추가와 선택한 테마의 기업 추가 화면을 연다", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "테마 추가" }));

    expect(
      screen.getByRole("dialog", { name: "테마 추가" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    fireEvent.click(screen.getByRole("button", { name: "기업 추가" }));

    expect(
      await screen.findByRole("dialog", {
        name: `${rootTheme.name}에 기업 추가`,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "추가할 기업" }));

    expect(
      screen.getByRole("option", { name: /삼성전자/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /삼성SDI/ }),
    ).not.toBeInTheDocument();
  });
});
