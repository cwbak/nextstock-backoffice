import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SectorsPage } from "@/features/sectors/components/sectors-page";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";
import { mockSectorApi } from "@/test/mocks/sector-api";

const sectors = [
  { id: 1, name: "기술", parentId: null },
  { id: 2, name: "반도체", parentId: 1 },
  { id: 3, name: "장비", parentId: 2 },
  { id: 4, name: "금융", parentId: null },
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

describe("SectorsPage", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.closeEditor();
    sectorUiActions.closeDelete();
    vi.restoreAllMocks();
  });

  it("계층 경로를 표시하고 섹터명과 상위 경로로 검색한다", async () => {
    mockSectorApi(sectors);
    renderPage();
    expect(
      screen.getByRole("status", { name: "섹터 목록 불러오는 중" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("기술 › 반도체")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "섹터 검색" }), {
      target: { value: "반도체" },
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "금융 섹터 수정" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "장비 섹터 수정" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "반도체 섹터 수정" }),
    ).toBeInTheDocument();
  });

  it("하위 섹터 추가 시 부모를 미리 선택하고 저장 후 목록을 갱신한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "반도체 하위 섹터 추가" }),
    );
    expect(
      screen.getByRole("combobox", { name: "상위 섹터" }),
    ).toHaveTextContent("기술 › 반도체 (#2)");
    fireEvent.change(screen.getByRole("textbox", { name: "섹터명" }), {
      target: { value: " 설계 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(
      await screen.findByRole("button", { name: "설계 섹터 수정" }),
    ).toBeInTheDocument();
    expect(api.sectors.get(5)).toEqual({ id: 5, name: "설계", parentId: 2 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("수정 창은 최신 단건을 조회하고 자기 자신과 모든 하위를 부모에서 제외한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    const edit = await screen.findByRole("button", {
      name: "반도체 섹터 수정",
    });
    api.sectors.set(2, { id: 2, name: "최신 반도체", parentId: 1 });
    fireEvent.click(edit);
    const name = await screen.findByRole("textbox", { name: "섹터명" });
    expect(name).toHaveValue("최신 반도체");
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    expect(
      screen.queryByRole("option", { name: /#2/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /#3/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "없음 (최상위 섹터)" }));
    fireEvent.change(name, { target: { value: "독립 반도체" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(
      await screen.findByRole("button", { name: "독립 반도체 섹터 수정" }),
    ).toBeInTheDocument();
    expect(api.sectors.get(2)).toEqual({
      id: 2,
      name: "독립 반도체",
      parentId: null,
    });
    expect(
      api.fetchMock.mock.calls.some(
        ([path, init]) => path === "/admin/sectors/2" && !init?.method,
      ),
    ).toBe(true);
  });

  it("수정 창을 다시 열 때 캐시가 신선해도 단건을 다시 조회한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "반도체 섹터 수정" }),
    );
    expect(await screen.findByRole("textbox", { name: "섹터명" })).toHaveValue(
      "반도체",
    );
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    api.sectors.set(2, { id: 2, name: "다른 관리자의 변경", parentId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "반도체 섹터 수정" }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "섹터명" })).toHaveValue(
        "다른 관리자의 변경",
      ),
    );
    expect(
      api.fetchMock.mock.calls.filter(
        ([path, init]) => path === "/admin/sectors/2" && !init?.method,
      ),
    ).toHaveLength(2);
  });

  it("삭제 전에 모든 깊이의 하위 수를 안내하고 취소하거나 일괄 삭제한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "기술 섹터 삭제" }),
    );
    expect(
      screen.getByRole("alertdialog", { name: "섹터를 삭제할까요?" }),
    ).toHaveTextContent("하위 2개를 포함해 총 3개");
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(api.sectors.size).toBe(4);
    fireEvent.click(screen.getByRole("button", { name: "기술 섹터 삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "기술 섹터 수정" }),
      ).not.toBeInTheDocument(),
    );
    expect([...api.sectors.keys()]).toEqual([4]);
    expect(
      screen.getByRole("button", { name: "금융 섹터 수정" }),
    ).toBeInTheDocument();
  });

  it("추가 실패 시 창과 입력을 유지하고 오류를 표시한다", async () => {
    const api = mockSectorApi(sectors);
    api.control.fail = (_, method) => method === "POST";
    renderPage();
    await screen.findByRole("button", { name: "기술 섹터 수정" });
    fireEvent.click(screen.getByRole("button", { name: "섹터 추가" }));
    fireEvent.change(screen.getByRole("textbox", { name: "섹터명" }), {
      target: { value: "신규" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(
      await screen.findByText("섹터를 저장하지 못했습니다"),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "섹터명" })).toHaveValue("신규");
    expect(api.sectors.size).toBe(4);
  });

  it("목록 조회 오류에서 다시 시도할 수 있다", async () => {
    const api = mockSectorApi(sectors);
    api.control.fail = () => true;
    renderPage();
    expect(
      await screen.findByText("섹터를 불러오지 못했습니다"),
    ).toBeInTheDocument();
    api.control.fail = null;
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(
      await screen.findByRole("button", { name: "기술 섹터 수정" }),
    ).toBeInTheDocument();
  });

  it("빈 목록에서 최상위 섹터 추가를 시작할 수 있다", async () => {
    mockSectorApi([]);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "첫 섹터 추가" }),
    );
    expect(
      screen.getByRole("dialog", { name: "섹터 추가" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "상위 섹터" }),
    ).toHaveTextContent("없음 (최상위 섹터)");
  });
});
