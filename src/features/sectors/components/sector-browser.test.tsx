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
  { id: 1, name: "기술", depth: "major", parentId: null },
  { id: 2, name: "반도체", depth: "middle", parentId: 1 },
  { id: 3, name: "장비", depth: "minor", parentId: 2 },
  { id: 4, name: "금융", depth: "major", parentId: null },
  { id: 5, name: "은행", depth: "middle", parentId: 4 },
  { id: 6, name: "지방은행", depth: "minor", parentId: 5 },
  { id: 7, name: "소프트웨어", depth: "middle", parentId: 1 },
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

describe("sector views", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.resetBrowser();
    sectorUiActions.closeEditor();
    sectorUiActions.closeDelete();
    sectorUiActions.closeSync();
    vi.restoreAllMocks();
  });

  it("ALL은 처음에 대분류만 표시하고 선택한 경로의 하위만 연다", async () => {
    mockSectorApi(sectors);
    renderPage();
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    const majorList = await screen.findByRole("list", { name: "대분류 목록" });
    expect(within(majorList).getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "반도체 선택" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("대분류를 선택하세요")).toBeInTheDocument();
    expect(screen.getByText("중분류를 선택하세요")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    expect(screen.getByRole("button", { name: "기술 선택" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "반도체 선택" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "은행 선택" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "반도체 선택" }));
    expect(
      screen.getByRole("button", { name: "장비 섹터 수정" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "금융 선택" }));
    expect(
      screen.getByRole("button", { name: "은행 선택" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "장비 섹터 수정" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("중분류를 선택하세요")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "은행 선택" }));
    expect(
      screen.getByRole("button", { name: "지방은행 섹터 수정" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["major", ["금융", "기술"]],
    ["middle", ["반도체", "소프트웨어", "은행"]],
    ["minor", ["장비", "지방은행"]],
  ] as const)("%s는 해당 depth 전체만 표시한다", async (view, names) => {
    mockSectorApi(sectors);
    renderPage();
    await screen.findByRole("button", { name: "기술 선택" });
    fireEvent.click(screen.getByRole("radio", { name: view }));
    expect(screen.getByRole("radio", { name: view })).toBeChecked();
    const shown = screen
      .getAllByRole("button", { name: /섹터 수정$/ })
      .map((button) => button.getAttribute("aria-label"));
    expect(shown.sort()).toEqual(
      names.map((name) => `${name} 섹터 수정`).sort(),
    );
    expect(
      screen.queryByRole("region", { name: "섹터 계층 탐색" }),
    ).not.toBeInTheDocument();
  });

  it("하위 이름으로 검색해도 부모를 선택해 찾아갈 수 있다", async () => {
    mockSectorApi(sectors);
    renderPage();
    await screen.findByRole("button", { name: "기술 선택" });
    fireEvent.change(screen.getByRole("searchbox", { name: "섹터 검색" }), {
      target: { value: "장비" },
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "금융 선택" }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    expect(
      screen.queryByRole("button", { name: "소프트웨어 선택" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "반도체 선택" }));
    expect(
      screen.getByRole("button", { name: "장비 섹터 수정" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "섹터 검색" }), {
      target: { value: "없는 섹터" },
    });
    await screen.findByText("검색 결과가 없습니다");
    expect(
      screen.queryByRole("button", { name: "장비 섹터 수정" }),
    ).not.toBeInTheDocument();
  });

  it("새로고침으로 선택한 부모가 사라지면 이전 하위를 닫는다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "기술 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "반도체 선택" }));
    for (const id of [1, 2, 3, 7]) api.sectors.delete(id);
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "기술 선택" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "장비 섹터 수정" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("대분류를 선택하세요")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "금융 선택" }));
    expect(
      screen.getByRole("button", { name: "은행 선택" }),
    ).toBeInTheDocument();
  });

  it("빈 분류와 연결된 하위가 없는 경우를 안내하며 ALL을 해제하지 않는다", async () => {
    mockSectorApi(sectors.filter((sector) => sector.depth !== "minor"));
    renderPage();
    await screen.findByRole("button", { name: "기술 선택" });
    fireEvent.click(screen.getByRole("radio", { name: "ALL" }));
    expect(screen.getByRole("radio", { name: "ALL" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "소프트웨어 선택" }));
    expect(screen.getByText("연결된 소분류가 없습니다")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "minor" }));
    expect(
      screen.getByText("등록된 소분류 섹터가 없습니다"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "ALL" }));
    expect(
      screen.getByRole("button", { name: "소프트웨어 선택" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
