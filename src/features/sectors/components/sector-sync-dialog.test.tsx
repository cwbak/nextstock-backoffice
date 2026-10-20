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

import { sectorKeys } from "@/data-access/queries/sectors/keys";
import type { Sector } from "@/data-access/schemas/sector";
import { SectorsPage } from "@/features/sectors/components/sectors-page";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";
import { mockSectorApi } from "@/test/mocks/sector-api";

const initial: Sector[] = [
  { id: 10, name: "기술", depth: "major", parentId: null },
  { id: 42, name: "반도체", depth: "middle", parentId: 10 },
  { id: 99, name: "수동 섹터", depth: "major", parentId: null },
];
const latest: Sector[] = [
  { id: 10, name: "기술", depth: "major", parentId: null },
  { id: 42, name: "반도체 부품", depth: "middle", parentId: 10 },
  { id: 103, name: "장비", depth: "minor", parentId: 42 },
  { id: 104, name: "설계", depth: "minor", parentId: 42 },
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

describe("sector synchronization", () => {
  afterEach(() => {
    cleanup();
    sectorUiActions.closeEditor();
    sectorUiActions.closeDelete();
    sectorUiActions.closeSync();
    sectorUiActions.resetBrowser();
    vi.restoreAllMocks();
  });

  it("삭제와 수동 수정 덮어쓰기를 안내하고 실행 전에는 요청하지 않는다", async () => {
    const api = mockSectorApi(initial);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    const dialog = screen.getByRole("alertdialog", { name: "섹터 동기화" });
    expect(dialog).toHaveTextContent("수동 생성 항목도 삭제됩니다.");
    expect(dialog).toHaveTextContent("전체 섹터가 삭제됩니다.");
    expect(dialog).toHaveTextContent(
      "수동 수정한 값도 Toss의 값으로 바뀝니다.",
    );
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(
      api.fetchMock.mock.calls.some(([path]) => path === "/admin/sectors/sync"),
    ).toBe(false);
  });

  it("추가·수정·삭제·유지 건수를 표시하고 목록과 상세 캐시를 갱신한다", async () => {
    const api = mockSectorApi(initial);
    api.control.syncSectors = latest;
    const client = renderPage();
    client.setQueryData(sectorKeys.detail(99), initial[2]);
    client.setQueryData(sectorKeys.detail(42), initial[1]);
    await screen.findByRole("button", { name: "수동 섹터 섹터 수정" });
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByText("섹터 동기화를 완료했습니다"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("table", { name: "섹터 동기화 결과" }))
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["2", "1", "1", "1"]);
    const calls = api.fetchMock.mock.calls.filter(
      ([path]) => path === "/admin/sectors/sync",
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]?.method).toBe("POST");
    expect(calls[0]?.[1]?.body).toBeUndefined();
    expect(client.getQueryData(sectorKeys.detail(99))).toBeUndefined();
    expect(client.getQueryData(sectorKeys.detail(42))).toBeUndefined();
    expect(client.getQueryData(sectorKeys.list())).toEqual(latest);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    fireEvent.click(screen.getByRole("button", { name: "기술 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "반도체 부품 선택" }));
    expect(
      screen.getByRole("button", { name: "장비 섹터 수정" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "수동 섹터 섹터 수정" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));
    expect(
      screen.queryByText("섹터 동기화를 완료했습니다"),
    ).not.toBeInTheDocument();
  });

  it("진행 중 창 닫기와 중복 실행을 막는다", async () => {
    const api = mockSectorApi(initial);
    let complete = () => {};
    api.control.syncGate = new Promise<void>((resolve) => {
      complete = resolve;
    });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(await screen.findByText("Toss 섹터 동기화 중")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    const running = screen.getByRole("button", { name: "동기화 중" });
    expect(running).toBeDisabled();
    fireEvent.click(running);
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      api.fetchMock.mock.calls.filter(
        ([path]) => path === "/admin/sectors/sync",
      ),
    ).toHaveLength(1);
    complete();
    await screen.findByText("섹터 동기화를 완료했습니다");
  });

  it("Toss 오류를 표시하고 자동 재시도 없이 사용자가 재시도할 수 있다", async () => {
    const api = mockSectorApi(initial);
    api.control.syncError = "sector source lookup failed";
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByText(
        "Toss 섹터를 조회하지 못했습니다. 서버의 Toss 설정과 연결 상태를 확인해 주세요.",
      ),
    ).toBeInTheDocument();
    expect([...api.sectors.values()]).toEqual(initial);
    expect(
      api.fetchMock.mock.calls.filter(
        ([path]) => path === "/admin/sectors/sync",
      ),
    ).toHaveLength(1);
    api.control.syncError = null;
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await screen.findByText("섹터 동기화를 완료했습니다");
    expect(
      within(screen.getByRole("table", { name: "섹터 동기화 결과" }))
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["0", "0", "0", "3"]);
  });

  it("빈 외부 목록으로 전체가 삭제된 결과와 빈 화면을 표시한다", async () => {
    const api = mockSectorApi(initial);
    api.control.syncSectors = [];
    renderPage();
    await screen.findByRole("button", { name: "기술 섹터 수정" });
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    await screen.findByText("섹터 동기화를 완료했습니다");
    expect(
      within(screen.getByRole("table", { name: "섹터 동기화 결과" }))
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["0", "0", "3", "0"]);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.getByText("등록된 섹터가 없습니다")).toBeInTheDocument();
  });

  it("결과 형식이 잘못되면 완료로 표시하지 않는다", async () => {
    const api = mockSectorApi(initial);
    renderPage();
    await screen.findByRole("button", { name: "기술 섹터 수정" });
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));
    api.fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ created: 10 }), { status: 200 }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByText("서버 응답 형식이 API 명세와 다릅니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("섹터 동기화를 완료했습니다"),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "다시 시도" })).toBeEnabled(),
    );
  });
});
