import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KrStockUpsertDialog } from "@/features/kr-stocks/components/kr-stock-create-dialog";

const krStock = {
  code: "005930",
  corporationCode: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  listDd: "1975-06-11",
  listShrs: 5_969_782_550,
  marketType: "KOSDAQ",
  name: "삼성전자",
  parval: 100,
  stockType: "보통주",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

describe("KrStockUpsertDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("선택한 대체 시장을 KR 종목 생성·갱신 API로 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(krStock), {
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
        <KrStockUpsertDialog open onOpenChange={onOpenChange} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "DART 법인 코드" }), {
      target: { value: "00126380" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "종목 코드" }), {
      target: { value: "005930" },
    });
    fireEvent.click(
      screen.getByRole("combobox", { name: "대체 상장 시장 (선택)" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "KOSDAQ (K)" }));
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        corporationClass: "K",
        corporationCode: "00126380",
        stockCode: "005930",
      }),
    );
  });

  it("입력한 대체 상장일을 KR 종목 생성·갱신 API로 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(krStock), {
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
        <KrStockUpsertDialog open onOpenChange={onOpenChange} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "DART 법인 코드" }), {
      target: { value: "00126380" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "종목 코드" }), {
      target: { value: "005930" },
    });
    fireEvent.change(screen.getByLabelText("대체 상장일 (선택)"), {
      target: { value: "1975-06-11" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        corporationCode: "00126380",
        listDd: "1975-06-11",
        stockCode: "005930",
      }),
    );
  });
});
