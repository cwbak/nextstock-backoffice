import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { backgroundJobKeys } from "@/data-access/queries/background-jobs/keys";
import type { Sector } from "@/data-access/schemas/sector";
import { SectorsPage } from "@/features/sectors/components/sectors-page";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";
import { mockSectorApi } from "@/test/mocks/sector-api";

const initial: Sector[] = [
  {
    id: 10,
    name: "기술",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 42,
    name: "반도체",
    depth: "middle",
    parentId: 10,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 99,
    name: "수동 섹터",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
];
const latest: Sector[] = [
  {
    id: 10,
    name: "기술",
    depth: "major",
    parentId: null,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 42,
    name: "반도체 부품",
    depth: "middle",
    parentId: 10,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 103,
    name: "장비",
    depth: "minor",
    parentId: 42,
    isLeaf: false,
    isEmpty: false,
  },
  {
    id: 104,
    name: "설계",
    depth: "minor",
    parentId: 42,
    isLeaf: false,
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
    api.control.stocksSkipped = 3;
    api.stocks.set(10, [{ code: "005930", name: "삼성전자" }]);
    api.control.syncStocks = new Map([
      [10, [{ code: "000660", name: "SK하이닉스" }]],
    ]);
    const client = renderPage();
    client.setQueryData(sectorKeys.stocks(10), [
      { code: "005930", name: "삼성전자" },
    ]);
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
    expect(screen.getByText("미등록 종목으로 건너뛴 연결")).toBeInTheDocument();
    expect(screen.getByText("3건")).toBeInTheDocument();
    const calls = api.fetchMock.mock.calls.filter(
      ([path]) => path === "/admin/sectors/sync",
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]?.method).toBe("POST");
    expect(calls[0]?.[1]?.body).toBeUndefined();
    expect(client.getQueryData(sectorKeys.detail(99))).toBeUndefined();
    expect(client.getQueryData(sectorKeys.detail(42))).toBeUndefined();
    await waitFor(() =>
      expect(client.getQueryData(sectorKeys.list())).toEqual(latest),
    );
    expect(client.getQueryState(sectorKeys.stocks(10))?.isInvalidated).toBe(
      true,
    );
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
    expect(await screen.findByText("동기화 작업 등록 중")).toBeInTheDocument();
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

  it("동기화 완료 후 현재 선택한 섹터의 종목 목록도 다시 조회한다", async () => {
    const api = mockSectorApi(initial);
    api.stocks.set(10, [{ code: "005930", name: "삼성전자" }]);
    api.control.syncStocks = new Map([
      [10, [{ code: "000660", name: "SK하이닉스" }]],
    ]);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "기술 선택" }));
    await screen.findByText("삼성전자");
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    await screen.findByText("섹터 동기화를 완료했습니다");
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(await screen.findByText("SK하이닉스")).toBeInTheDocument();
    expect(screen.queryByText("삼성전자")).not.toBeInTheDocument();
  });

  it("작업 등록 오류를 표시하고 자동 재등록 없이 사용자가 재시도할 수 있다", async () => {
    const api = mockSectorApi(initial);
    api.control.syncError = "background jobs are unavailable";
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByText("백그라운드 작업 저장소가 구성되지 않았습니다."),
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

  it("기존 작업의 대기·진행률·저장을 표시하며 100%여도 COMPLETED 전에는 갱신하지 않는다", async () => {
    const api = mockSectorApi(initial);
    api.control.jobStatus = "QUEUED";
    api.control.jobCreated = false;
    api.control.syncSectors = latest;
    const client = renderPage();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    await screen.findByText("Worker 처리 대기 중");
    expect(
      screen.getByText("이미 진행 중인 동기화 작업을 확인하고 있습니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    api.control.jobStatus = "RUNNING";
    api.control.jobStage = "FETCHING_SECTOR_STOCKS";
    await act(() =>
      client.refetchQueries({ queryKey: backgroundJobKeys.detail(42) }),
    );
    await screen.findByText(/섹터별 구성 종목 조회/);
    expect(
      screen.getByRole("progressbar", { name: "백그라운드 작업 진행률" }),
    ).toHaveAttribute("value", "100");
    expect(
      screen.queryByText("섹터 동기화를 완료했습니다"),
    ).not.toBeInTheDocument();
    expect(invalidate).not.toHaveBeenCalled();
    expect([...api.sectors.values()]).toEqual(initial);
    api.control.jobStage = "SAVING_SECTORS";
    await act(() =>
      client.refetchQueries({ queryKey: backgroundJobKeys.detail(42) }),
    );
    await screen.findByText(/섹터와 종목 연결 저장/);
    api.control.jobStatus = "COMPLETED";
    await act(() =>
      client.refetchQueries({ queryKey: backgroundJobKeys.detail(42) }),
    );
    await screen.findByText("섹터 동기화를 완료했습니다");
    await waitFor(() =>
      expect(client.getQueryData(sectorKeys.list())).toEqual(latest),
    );
    expect(
      api.fetchMock.mock.calls.filter(
        ([path]) => path === "/admin/sectors/sync",
      ),
    ).toHaveLength(1);
  });

  it("worker 실패 사유를 표시하고 결과를 갱신하지 않으며 재시도할 수 있다", async () => {
    const api = mockSectorApi(initial);
    api.control.jobStatus = "FAILED";
    api.control.jobError = "Toss 구성 종목 조회에 실패했습니다.";
    const client = renderPage();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    await screen.findByText("Toss 구성 종목 조회에 실패했습니다.");
    expect(invalidate).not.toHaveBeenCalled();
    expect([...api.sectors.values()]).toEqual(initial);
    api.control.jobStatus = "COMPLETED";
    api.control.jobError = null;
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await screen.findByText("섹터 동기화를 완료했습니다");
  });

  it("완료 작업의 결과가 잘못되면 성공으로 표시하지 않는다", async () => {
    const api = mockSectorApi(initial);
    api.control.jobResult = { created: 10 };
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "동기화" }));
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    await screen.findByText("완료된 작업 결과가 API 명세와 다릅니다.");
    expect(
      screen.queryByText("섹터 동기화를 완료했습니다"),
    ).not.toBeInTheDocument();
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
    expect(
      await screen.findByText("등록된 섹터가 없습니다"),
    ).toBeInTheDocument();
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
