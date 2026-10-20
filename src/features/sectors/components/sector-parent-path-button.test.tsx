import {
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
  {
    id: 1,
    name: "기술",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 2,
    name: "반도체",
    depth: "middle",
    parentId: 1,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 3,
    name: "장비",
    depth: "minor",
    parentId: 2,
    isLeaf: true,
    isEmpty: false,
  },
  {
    id: 4,
    name: "금융",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 5,
    name: "은행",
    depth: "middle",
    parentId: 4,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 6,
    name: "지방은행",
    depth: "minor",
    parentId: 5,
    isLeaf: true,
    isEmpty: false,
  },
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
}

function seedPreviousBranch() {
  sectorUiActions.selectMajor(4);
  sectorUiActions.selectMiddle(5);
  sectorUiActions.selectSector(6);
}

describe("sector parent path navigation", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.resetBrowser();
    sectorUiActions.closeEditor();
    sectorUiActions.closeDelete();
    sectorUiActions.closeSync();
    vi.restoreAllMocks();
  });

  it("소분류의 상위 경로는 ALL에서 대·중분류를 선택하고 부모의 종목을 표시한다", async () => {
    const api = mockSectorApi(sectors);
    api.stocks.set(2, [{ code: "005930", name: "삼성전자" }]);
    seedPreviousBranch();
    sectorUiActions.setBrowserView("minor");
    renderPage();
    const path = await screen.findByRole("button", {
      name: "장비 상위 경로를 ALL에서 보기",
    });
    expect(path).toHaveTextContent("기술 › 반도체");
    fireEvent.click(path);
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    expect(screen.getByRole("button", { name: "기술 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "반도체 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "장비 선택" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: "지방은행 선택" }),
    ).not.toBeInTheDocument();
    const stocks = await screen.findByRole("table", {
      name: "반도체 종목 목록",
    });
    expect(within(stocks).getByText("삼성전자")).toBeInTheDocument();
  });

  it("중분류의 상위 경로는 ALL에서 대분류까지만 선택하고 이전 중분류를 해제한다", async () => {
    mockSectorApi(sectors);
    seedPreviousBranch();
    sectorUiActions.setBrowserView("middle");
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "반도체 상위 경로를 ALL에서 보기",
      }),
    );
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    expect(screen.getByRole("button", { name: "기술 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "반도체 선택" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText("중분류를 선택하세요")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "장비 선택" }),
    ).not.toBeInTheDocument();
    await screen.findByText("기술 종목");
  });

  it("대분류의 최상위 경로는 ALL 초기 화면으로 이동하며 이전 선택을 비운다", async () => {
    mockSectorApi(sectors);
    seedPreviousBranch();
    sectorUiActions.setBrowserView("major");
    renderPage();
    const path = await screen.findByRole("button", {
      name: "기술 상위 경로를 ALL에서 보기",
    });
    expect(path).toHaveTextContent("최상위 섹터");
    fireEvent.click(path);
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    expect(screen.getByRole("button", { name: "기술 선택" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "금융 선택" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText("대분류를 선택하세요")).toBeInTheDocument();
    expect(screen.getByText("중분류를 선택하세요")).toBeInTheDocument();
    expect(
      screen.getByText("종목을 확인할 섹터를 선택하세요"),
    ).toBeInTheDocument();
  });

  it("검색한 소분류에서 이동해도 검색어를 유지하고 상위 경로를 연다", async () => {
    mockSectorApi(sectors);
    sectorUiActions.setBrowserView("minor");
    renderPage();
    await screen.findByRole("button", {
      name: "장비 상위 경로를 ALL에서 보기",
    });
    fireEvent.change(screen.getByRole("searchbox", { name: "섹터 검색" }), {
      target: { value: "장비" },
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "지방은행 상위 경로를 ALL에서 보기",
        }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "장비 상위 경로를 ALL에서 보기" }),
    );
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    expect(screen.getByRole("searchbox", { name: "섹터 검색" })).toHaveValue(
      "장비",
    );
    expect(screen.getByRole("button", { name: "기술 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "반도체 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "장비 선택" }),
    ).toBeInTheDocument();
  });
});
