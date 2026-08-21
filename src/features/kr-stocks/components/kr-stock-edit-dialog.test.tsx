import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Corporation } from "@/data-access/schemas/corporation";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { KrStockEditDialog } from "@/features/kr-stocks/components/kr-stock-edit-dialog";

const corporation: Corporation = {
  accMt: 12,
  address: "경기도 수원시 영통구 삼성로 129",
  ceoNm: "한종희",
  code: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  estDt: "1969-01-13",
  hmUrl: "https://www.samsung.com/sec",
  indutyCode: "264",
  info: null,
  name: "삼성전자",
  nameEn: "Samsung Electronics",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

const krStock: KrStock = {
  code: "005930",
  corporationCode: corporation.code,
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

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

describe("KrStockEditDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("기존 종목명 별칭을 불러와 수정 API로 전송한다", async () => {
    const aliases = ["삼성전자 보통주", "삼전"];
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(aliases), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...krStock, status: "SUSPENDED" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(aliases), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      );
    const onOpenChange = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <KrStockEditDialog
          corporations={[corporation]}
          krStock={krStock}
          open
          onOpenChange={onOpenChange}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("status", { name: "기존 종목명 별칭 불러오는 중" }),
    ).toBeInTheDocument();
    const aliasesInput = await screen.findByRole("textbox", {
      name: "종목명 별칭 (선택)",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/005930/name-aliases",
    );
    expect(aliasesInput).toHaveValue("삼성전자 보통주\n삼전");

    fireEvent.click(screen.getByRole("combobox", { name: "종목 상태" }));
    fireEvent.click(
      screen.getByRole("option", { name: "거래 정지 (SUSPENDED)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/stocks/005930");
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("PUT");
    expect(parseRequestBody(fetchMock.mock.calls[1]?.[1]?.body)).toEqual({
      aliases,
      corporationCode: "00126380",
      listDd: "1975-06-11",
      listShrs: 5_969_782_550,
      marketType: "KOSPI",
      name: "삼성전자",
      parval: 100,
      status: "SUSPENDED",
      stockType: "보통주",
    });
  });

  it("종목명 별칭 조회 실패 시 수정 폼 대신 오류 상태를 표시한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "internal server error" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <KrStockEditDialog
          corporations={[corporation]}
          krStock={krStock}
          open
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("종목명 별칭을 불러오지 못했습니다"),
    ).toBeInTheDocument();
    expect(screen.getByText("서버 내부 오류가 발생했습니다.")).toBeVisible();
    expect(
      screen.queryByRole("textbox", { name: "종목 코드" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeEnabled();
  });
});
