import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Sector } from "@/data-access/schemas/sector";
import { SectorsPage } from "@/features/sectors/components/sectors-page";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";
import { mockSectorApi } from "@/test/mocks/sector-api";

const sectors: Sector[] = [
  { id: 10, name: "기술", depth: "major", parentId: null },
  { id: 42, name: "반도체", depth: "middle", parentId: 10 },
  { id: 103, name: "장비", depth: "minor", parentId: 42 },
  { id: 20, name: "금융", depth: "major", parentId: null },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <SectorsPage />
    </QueryClientProvider>,
  );
  return client;
}

function stocksPanel() {
  return within(screen.getByRole("region", { name: "선택한 섹터의 종목" }));
}

describe("sector stock selection", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.resetBrowser();
    sectorUiActions.closeDelete();
    sectorUiActions.closeEditor();
    sectorUiActions.closeSync();
    vi.restoreAllMocks();
  });

  it("선택 전에는 요청하지 않고 ALL의 각 분류를 선택하면 해당 종목만 조회한다", async () => {
    const api = mockSectorApi(sectors);
    api.stocks.set(10, [{ code: "005930", name: "삼성전자" }]);
    api.stocks.set(42, [{ code: "000660", name: "SK하이닉스" }]);
    api.stocks.set(103, [{ code: "042700", name: "한미반도체" }]);
    renderPage();
    await screen.findByRole("button", { name: "기술 선택" });
    expect(
      stocksPanel().getByText("종목을 확인할 섹터를 선택하세요"),
    ).toBeInTheDocument();
    expect(
      api.fetchMock.mock.calls.filter(
        ([path]) =>
          typeof path === "string" && path.startsWith("/api/sectors/"),
      ),
    ).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    expect(await stocksPanel().findByText("삼성전자")).toBeInTheDocument();
    expect(stocksPanel().getByText("005930")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "반도체 선택" }));
    await stocksPanel().findByText("SK하이닉스");
    expect(stocksPanel().queryByText("삼성전자")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "장비 선택" }));
    await stocksPanel().findByText("한미반도체");
    expect(stocksPanel().queryByText("SK하이닉스")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "장비 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "금융 선택" }));
    await stocksPanel().findByText("연결된 종목이 없습니다");
    expect(stocksPanel().queryByText("한미반도체")).not.toBeInTheDocument();
  });

  it.each([
    ["major", "기술", 10],
    ["middle", "반도체", 42],
    ["minor", "장비", 103],
  ] as const)(
    "%s 단일 분류에서도 섹터명을 선택해 종목을 확인한다",
    async (depth, name, id) => {
      const api = mockSectorApi(sectors);
      api.stocks.set(id, [{ code: "005930", name: "삼성전자" }]);
      renderPage();
      await screen.findByRole("button", { name: "기술 선택" });
      fireEvent.click(screen.getByRole("radio", { name: depth }));
      fireEvent.click(screen.getByRole("button", { name: `${name} 선택` }));
      await stocksPanel().findByRole("table", { name: `${name} 종목 목록` });
      expect(stocksPanel().getByText("삼성전자")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("radio", { name: "ALL" }));
      expect(stocksPanel().queryByText("삼성전자")).not.toBeInTheDocument();
      expect(
        stocksPanel().getByText("종목을 확인할 섹터를 선택하세요"),
      ).toBeInTheDocument();
    },
  );

  it("선택을 빨리 바꾸면 이전 요청을 취소하고 늦은 응답이 목록을 덮어쓰지 않는다", async () => {
    const api = mockSectorApi(sectors);
    api.stocks.set(20, [{ code: "105560", name: "KB금융" }]);
    renderPage();
    await screen.findByRole("button", { name: "기술 선택" });
    let resolveSlow: (response: Response) => void = () => {};
    const slowResponse = new Promise<Response>((resolve) => {
      resolveSlow = resolve;
    });
    let signal: AbortSignal | null | undefined;
    api.fetchMock.mockImplementationOnce((_input, init) => {
      signal = init?.signal;
      return slowResponse;
    });
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    await screen.findByRole("status", { name: "섹터 종목 불러오는 중" });
    fireEvent.click(screen.getByRole("button", { name: "금융 선택" }));
    await stocksPanel().findByText("KB금융");
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      resolveSlow(
        new Response(JSON.stringify([{ code: "005930", name: "삼성전자" }])),
      );
      await slowResponse;
    });
    expect(stocksPanel().queryByText("삼성전자")).not.toBeInTheDocument();
    expect(stocksPanel().getByText("KB금융")).toBeInTheDocument();
  });

  it("조회 오류와 재시도를 제공하고 잘못된 응답을 빈 목록으로 숨기지 않는다", async () => {
    const api = mockSectorApi(sectors);
    api.control.fail = (path) => path === "/api/sectors/10/stocks";
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "기술 선택" }));
    await stocksPanel().findByText("섹터 종목을 불러오지 못했습니다");
    api.control.fail = null;
    api.fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([{ stock_code: "005930", name: "삼성전자" }]),
      ),
    );
    fireEvent.click(stocksPanel().getByRole("button", { name: "다시 시도" }));
    await stocksPanel().findByText("서버 응답 형식이 API 명세와 다릅니다.");
    api.stocks.set(10, [{ code: "005930", name: "삼성전자" }]);
    fireEvent.click(stocksPanel().getByRole("button", { name: "다시 시도" }));
    await stocksPanel().findByText("삼성전자");
  });

  it("새로고침은 선택한 종목도 갱신하고 섹터가 사라지면 이전 목록을 숨긴다", async () => {
    const api = mockSectorApi(sectors);
    api.stocks.set(10, [{ code: "005930", name: "삼성전자" }]);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "기술 선택" }));
    await stocksPanel().findByText("삼성전자");
    api.stocks.set(10, [{ code: "000660", name: "SK하이닉스" }]);
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    await stocksPanel().findByText("SK하이닉스");
    for (const id of [10, 42, 103]) api.sectors.delete(id);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "새로고침" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    await stocksPanel().findByText("종목을 확인할 섹터를 선택하세요");
    expect(stocksPanel().queryByText("SK하이닉스")).not.toBeInTheDocument();
  });
});
