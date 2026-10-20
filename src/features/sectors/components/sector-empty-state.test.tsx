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
    name: "빈 대분류",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: true,
  },
  {
    id: 2,
    name: "빈 중분류",
    depth: "middle",
    parentId: 1,
    isLeaf: false,
    isEmpty: true,
  },
  {
    id: 3,
    name: "빈 소분류",
    depth: "minor",
    parentId: 2,
    isLeaf: false,
    isEmpty: true,
  },
  {
    id: 4,
    name: "기술",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 5,
    name: "반도체",
    depth: "middle",
    parentId: 4,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 6,
    name: "장비",
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

function sectorButton(name: string) {
  return screen.getByRole("button", { name: `${name} 선택` });
}

describe("sector empty markers", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.resetBrowser();
    sectorUiActions.closeEditor();
    sectorUiActions.closeDelete();
    sectorUiActions.closeSync();
    vi.restoreAllMocks();
  });

  it("ALL에서 빈 원과 말단 점을 구분하고 직접 종목 목록이 비어도 isEmpty를 다시 계산하지 않는다", async () => {
    mockSectorApi(sectors);
    renderPage();
    await screen.findByRole("button", { name: "빈 대분류 선택" });
    for (const name of ["빈 대분류", "빈 중분류", "빈 소분류"]) {
      const button = sectorButton(name);
      expect(
        within(button).getByRole("img", { name: "빈 섹터" }),
      ).toHaveAttribute(
        "title",
        expect.stringContaining("자신과 모든 하위 섹터"),
      );
      expect(
        within(button).queryByRole("img", { name: "말단 섹터" }),
      ).not.toBeInTheDocument();
      fireEvent.click(button);
    }
    fireEvent.click(sectorButton("기술"));
    await screen.findByText("연결된 종목이 없습니다");
    expect(
      within(sectorButton("기술")).queryByRole("img"),
    ).not.toBeInTheDocument();
    fireEvent.click(sectorButton("반도체"));
    expect(
      within(sectorButton("장비")).getByRole("img", { name: "말단 섹터" }),
    ).toBeInTheDocument();
    expect(
      within(sectorButton("장비")).queryByRole("img", { name: "빈 섹터" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["major", "빈 대분류"],
    ["middle", "빈 중분류"],
    ["minor", "빈 소분류"],
  ] as const)("%s 단일 분류에서도 isEmpty를 표시한다", async (view, name) => {
    mockSectorApi(sectors);
    sectorUiActions.setBrowserView(view);
    renderPage();
    const button = await screen.findByRole("button", { name: `${name} 선택` });
    expect(
      within(button).getByRole("img", { name: "빈 섹터" }),
    ).toBeInTheDocument();
  });

  it("새로고침으로 isEmpty가 false로 바뀌면 빈 원을 없앤다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    const button = await screen.findByRole("button", {
      name: "빈 대분류 선택",
    });
    expect(
      within(button).getByRole("img", { name: "빈 섹터" }),
    ).toBeInTheDocument();
    api.sectors.set(1, {
      id: 1,
      name: "빈 대분류",
      depth: "major",
      parentId: null,
      isLeaf: false,
      isEmpty: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
    await waitFor(() =>
      expect(
        within(sectorButton("빈 대분류")).queryByRole("img", {
          name: "빈 섹터",
        }),
      ).not.toBeInTheDocument(),
    );
  });
});
