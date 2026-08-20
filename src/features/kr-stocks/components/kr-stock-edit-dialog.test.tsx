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

  it("변경한 종목 상태를 KR 종목 수정 API로 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ...krStock, status: "SUSPENDED" }), {
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

    fireEvent.click(screen.getByRole("combobox", { name: "종목 상태" }));
    fireEvent.click(
      screen.getByRole("option", { name: "거래 정지 (SUSPENDED)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks/005930");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("PUT");
    expect(parseRequestBody(fetchMock.mock.calls[0]?.[1]?.body)).toEqual({
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
});
