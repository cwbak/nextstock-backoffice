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
import { afterEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { equityInvestmentsQueryOptions } from "@/data-access/queries/equity-investments/queries";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { listedStocksQueryOptions } from "@/data-access/queries/listed-stocks/queries";
import { nasdaqInfoQueryOptions } from "@/data-access/queries/nasdaq-info/queries";
import { routeTree } from "@/routeTree.gen";

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
  queryClient.setQueryData(listedStocksQueryOptions.queryKey, []);
  queryClient.setQueryData(nasdaqInfoQueryOptions.queryKey, []);

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
        name: "나스닥 정보",
      }),
    );

    const nasdaqInfoInput = await screen.findByRole("searchbox", {
      name: "나스닥 정보 검색",
    });

    fireEvent.change(nasdaqInfoInput, { target: { value: "Apple" } });
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

    const listedStocksInput = await screen.findByRole("searchbox", {
      name: "상장 종목 검색",
    });

    fireEvent.compositionStart(listedStocksInput);
    fireEvent.change(listedStocksInput, { target: { value: "현대" } });
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

    await waitFor(() => expect(listedStocksInput).toBeVisible());
    expect(listedStocksInput).toHaveValue("현대");

    fireEvent.click(
      screen.getByRole("link", {
        name: "나스닥 정보",
      }),
    );

    await waitFor(() => expect(nasdaqInfoInput).toBeVisible());
    expect(nasdaqInfoInput).toHaveValue("Apple");
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
        name: "나스닥 정보",
      }),
    );

    const nasdaqInfoInput = await screen.findByRole("searchbox", {
      name: "나스닥 정보 검색",
    });

    fireEvent.change(nasdaqInfoInput, { target: { value: "NVDA" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/nasdaq-info");

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

    const listedStocksInput = await screen.findByRole("searchbox", {
      name: "상장 종목 검색",
    });

    fireEvent.change(listedStocksInput, { target: { value: "현대" } });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

    expect(router.state.location.href).toBe("/listed-stocks");

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
