import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeSyncDialog } from "@/features/themes/components/theme-sync-dialog";
import { themeSyncActions } from "@/features/themes/stores/use-theme-sync-store";
import { mockThemeSyncApi } from "@/test/mocks/theme-sync-api";

const json = JSON.stringify({
  themes: { "210": { name: "자전거", stocks: [{ stock_code: "065450" }] } },
});

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  themeSyncActions.setOpen(true);
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeSyncDialog />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "테마 JSON" }), {
    target: { value: json },
  });
}

describe("ThemeSyncDialog", () => {
  afterEach(() => {
    cleanup();
    themeSyncActions.setOpen(false);
    vi.restoreAllMocks();
  });

  it("미등록 종목의 코드와 테마 ID를 리포트하고 실행을 막는다", async () => {
    const api = mockThemeSyncApi(
      [{ id: 999, name: "삭제 대상", stocks: [] }],
      [],
    );
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "사전 검사" }));
    const report = await screen.findByRole("textbox", {
      name: "동기화 사전 검사 오류 리포트",
    });
    expect(report).toHaveValue("미등록 종목 065450 · 테마 #210 자전거");
    expect(screen.getByRole("button", { name: "동기화 실행" })).toBeDisabled();
    expect(
      api.fetchMock.mock.calls.every(
        ([, init]) => !init?.method || init.method === "GET",
      ),
    ).toBe(true);
    expect(api.themes.has(999)).toBe(true);
  });

  it("변경 내역 확인 후 실행하고 JSON과 일치한 결과를 보여 준다", async () => {
    const api = mockThemeSyncApi(
      [{ id: 999, name: "삭제 대상", stocks: [] }],
      ["065450"],
    );
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "사전 검사" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "동기화 실행" })).toBeEnabled(),
    );
    expect(
      screen.getByRole("textbox", { name: "동기화 상세 변경 내역" }),
    ).toHaveValue(
      "테마 추가 · #210 자전거\n테마 삭제 · #999 삭제 대상\n종목 연결 추가 · #210 / 065450",
    );
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByText("JSON과 동기화했습니다"),
    ).toBeInTheDocument();
    expect(api.snapshot()).toEqual([
      { id: 210, name: "자전거", stocks: ["065450"] },
    ]);
    expect(screen.getByRole("button", { name: "동기화 실행" })).toBeDisabled();
  });

  it("검사 뒤 JSON을 수정하면 이전 변경 내역을 실행하지 못한다", async () => {
    mockThemeSyncApi([], ["065450"]);
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "사전 검사" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "동기화 실행" })).toBeEnabled(),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "테마 JSON" }), {
      target: { value: '{"themes":{}}' },
    });
    expect(screen.getByRole("button", { name: "동기화 실행" })).toBeDisabled();
    expect(
      screen.queryByRole("textbox", { name: "동기화 상세 변경 내역" }),
    ).not.toBeInTheDocument();
  });

  it("잘못된 JSON은 서버 호출 전에 입력 오류로 표시한다", async () => {
    const api = mockThemeSyncApi([], []);
    renderDialog();
    fireEvent.change(screen.getByRole("textbox", { name: "테마 JSON" }), {
      target: { value: "{" },
    });
    fireEvent.click(screen.getByRole("button", { name: "사전 검사" }));
    expect(
      await screen.findByText(
        "JSON 형식이 올바르지 않습니다. 전체 파일 내용을 붙여 넣어 주세요.",
      ),
    ).toBeInTheDocument();
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("검사 이후 미등록 종목이 생겨도 실행 전 중단하고 리포트한다", async () => {
    const api = mockThemeSyncApi([], ["065450"]);
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "사전 검사" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "동기화 실행" })).toBeEnabled(),
    );
    api.stocks.delete("065450");
    fireEvent.click(screen.getByRole("button", { name: "동기화 실행" }));
    expect(
      await screen.findByRole("textbox", {
        name: "동기화 사전 검사 오류 리포트",
      }),
    ).toHaveValue("미등록 종목 065450 · 테마 #210 자전거");
    expect(
      api.fetchMock.mock.calls.every(
        ([, init]) => !init?.method || init.method === "GET",
      ),
    ).toBe(true);
  });
});
