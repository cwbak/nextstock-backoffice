import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { themesQueryOptions } from "@/data-access/queries/themes/queries";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import type { Theme } from "@/data-access/schemas/theme";
import { KrStockThemeAddDialog } from "@/features/kr-stocks/components/kr-stock-theme-add-dialog";

const krStock: KrStock = {
  code: "005930",
  corporationCode: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  listDd: "1975-06-11",
  listShrs: 5_969_782_550,
  marketType: "KOSPI",
  name: "삼성전자",
  parval: 100,
  status: "ACTIVE",
  stockType: "보통주",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

const themes: Theme[] = [
  {
    id: 449,
    parentThemeId: null,
    name: "2차전지(생산)",
    createdAt: "2026-08-09T10:00:00+09:00",
    updatedAt: "2026-08-09T10:00:00+09:00",
  },
  {
    id: 450,
    parentThemeId: 449,
    name: "2차전지(소재)",
    createdAt: "2026-08-09T10:00:00+09:00",
    updatedAt: "2026-08-09T10:00:00+09:00",
  },
];

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

function renderDialog(
  onOpenChange = vi.fn(),
  availableThemes: Theme[] = themes,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(themesQueryOptions.queryKey, availableThemes);

  render(
    <QueryClientProvider client={queryClient}>
      <KrStockThemeAddDialog krStock={krStock} onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  );
}

async function selectTheme(themeName: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "추가할 테마" }));
  fireEvent.change(screen.getByRole("searchbox", { name: "테마 검색" }), {
    target: { value: themeName },
  });
  fireEvent.click(await screen.findByText(themeName));
}

describe("KrStockThemeAddDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("검색해 선택한 테마에 현재 KR 종목을 추가한다", async () => {
    const onOpenChange = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(krStock, 201));
    renderDialog(onOpenChange);

    expect(
      screen.getByRole("dialog", { name: "테마에 기업 추가" }),
    ).toHaveTextContent("삼성전자 (005930)");

    await selectTheme("2차전지(소재)");
    fireEvent.click(screen.getByRole("button", { name: "테마에 추가" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/themes/450/stocks");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({ stockCode: "005930" });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("이미 포함된 종목이면 중복 오류를 표시한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ error: "stock already exists in theme" }, 409),
    );
    renderDialog();

    await selectTheme("2차전지(생산)");
    fireEvent.click(screen.getByRole("button", { name: "테마에 추가" }));

    expect(
      await screen.findByText("이미 이 테마에 포함된 종목입니다."),
    ).toBeInTheDocument();
  });

  it("등록된 시스템 테마가 없으면 빈 상태를 표시한다", () => {
    renderDialog(vi.fn(), []);

    expect(
      screen.getByText("등록된 시스템 테마가 없습니다"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "테마에 추가" }),
    ).not.toBeInTheDocument();
  });
});
