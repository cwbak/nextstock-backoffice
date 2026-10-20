import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
    expect(
      screen.getByRole("columnheader", { name: "분류" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "장비 하위 섹터 추가" }),
    ).not.toBeInTheDocument();
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

  it.each([
    ["대분류", ["금융", "기술"]],
    ["중분류", ["반도체"]],
    ["소분류", ["장비"]],
  ])("%s로 검색하면 해당 단계의 섹터만 표시한다", async (keyword, names) => {
    mockSectorApi(sectors);
    renderPage();
    await screen.findByRole("button", { name: "기술 섹터 수정" });
    fireEvent.change(screen.getByRole("searchbox", { name: "섹터 검색" }), {
      target: { value: keyword },
    });
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /섹터 수정$/ })
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual(names.map((name) => `${name} 섹터 수정`));
    });
  });

  it("중분류 생성에는 대분류 부모를 요구하고 요청에 분류를 포함한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    await screen.findByRole("button", { name: "기술 섹터 수정" });
    fireEvent.click(screen.getByRole("button", { name: "섹터 추가" }));
    fireEvent.change(screen.getByRole("textbox", { name: "섹터명" }), {
      target: { value: "소프트웨어" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "분류" }));
    fireEvent.click(screen.getByRole("option", { name: "중분류" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(
      await screen.findByText("중분류와 소분류에는 상위 섹터를 선택해 주세요."),
    ).toBeInTheDocument();
    expect(
      api.fetchMock.mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["금융 (#4)", "기술 (#1)"]);
    fireEvent.click(screen.getByRole("option", { name: "기술 (#1)" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(
      await screen.findByRole("button", { name: "소프트웨어 섹터 수정" }),
    ).toBeInTheDocument();
    expect(api.sectors.get(5)).toEqual({
      id: 5,
      name: "소프트웨어",
      depth: "middle",
      parentId: 1,
    });
  });

  it("하위가 없는 섹터의 분류 변경 시 기존 부모를 비우고 대분류에는 null을 저장한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "장비 섹터 수정" }),
    );
    await screen.findByRole("textbox", { name: "섹터명" });
    expect(screen.getByRole("combobox", { name: "분류" })).toBeEnabled();
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["기술 › 반도체 (#2)"]);
    fireEvent.click(screen.getByRole("option", { name: "기술 › 반도체 (#2)" }));
    fireEvent.click(screen.getByRole("combobox", { name: "분류" }));
    fireEvent.click(screen.getByRole("option", { name: "중분류" }));
    expect(
      screen.getByRole("combobox", { name: "상위 섹터" }),
    ).toHaveTextContent("상위 섹터를 선택하세요");
    fireEvent.click(screen.getByRole("combobox", { name: "분류" }));
    fireEvent.click(screen.getByRole("option", { name: "대분류" }));
    expect(screen.getByRole("combobox", { name: "상위 섹터" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(api.sectors.get(3)).toEqual({
      id: 3,
      name: "장비",
      depth: "major",
      parentId: null,
    });
  });

  it("편집 중 하위가 추가되면 서버의 분류 변경 오류를 표시하고 입력을 유지한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "금융 섹터 수정" }),
    );
    await screen.findByRole("textbox", { name: "섹터명" });
    fireEvent.click(screen.getByRole("combobox", { name: "분류" }));
    fireEvent.click(screen.getByRole("option", { name: "중분류" }));
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    fireEvent.click(screen.getByRole("option", { name: "기술 (#1)" }));
    api.sectors.set(5, { id: 5, name: "은행", depth: "middle", parentId: 4 });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(
      await screen.findByText("하위 섹터가 있어 분류를 변경할 수 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "분류" })).toHaveTextContent(
      "중분류",
    );
    expect(api.sectors.get(4)?.depth).toBe("major");
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
    expect(screen.getByRole("combobox", { name: "분류" })).toHaveTextContent(
      "소분류",
    );
    fireEvent.change(screen.getByRole("textbox", { name: "섹터명" }), {
      target: { value: " 설계 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(
      await screen.findByRole("button", { name: "설계 섹터 수정" }),
    ).toBeInTheDocument();
    expect(api.sectors.get(5)).toEqual({
      id: 5,
      name: "설계",
      depth: "minor",
      parentId: 2,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("최신 단건을 조회하고 하위가 있으면 분류를 고정하며 같은 단계의 부모로 이동한다", async () => {
    const api = mockSectorApi(sectors);
    renderPage();
    const edit = await screen.findByRole("button", {
      name: "반도체 섹터 수정",
    });
    api.sectors.set(2, {
      id: 2,
      name: "최신 반도체",
      depth: "middle",
      parentId: 1,
    });
    fireEvent.click(edit);
    const name = await screen.findByRole("textbox", { name: "섹터명" });
    expect(name).toHaveValue("최신 반도체");
    expect(screen.getByRole("combobox", { name: "분류" })).toBeDisabled();
    expect(
      screen.getByText("하위 섹터가 있어 분류를 변경할 수 없습니다."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    expect(
      screen.queryByRole("option", { name: /#2/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /#3/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /없음/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "금융 (#4)" }));
    fireEvent.change(name, { target: { value: "변경 반도체" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(
      await screen.findByRole("button", { name: "변경 반도체 섹터 수정" }),
    ).toBeInTheDocument();
    expect(api.sectors.get(2)).toEqual({
      id: 2,
      name: "변경 반도체",
      depth: "middle",
      parentId: 4,
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
    api.sectors.set(2, {
      id: 2,
      name: "다른 관리자의 변경",
      depth: "middle",
      parentId: 1,
    });
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
    ).toHaveTextContent("없음 (대분류)");
    expect(screen.getByRole("combobox", { name: "분류" })).toHaveTextContent(
      "대분류",
    );
    expect(screen.getByRole("combobox", { name: "상위 섹터" })).toBeDisabled();
    fireEvent.click(screen.getByRole("combobox", { name: "분류" }));
    fireEvent.click(screen.getByRole("option", { name: "소분류" }));
    fireEvent.click(screen.getByRole("combobox", { name: "상위 섹터" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "선택할 수 있는 중분류 섹터가 없습니다.",
    );
  });
});
