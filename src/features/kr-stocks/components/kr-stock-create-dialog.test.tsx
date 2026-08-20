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
  status: "ACTIVE",
  stockType: "보통주",
  updatedAt: "2026-07-26T11:00:00+09:00",
};
const corporations = [
  {
    accMt: 12,
    address: "경기도 수원시 영통구 삼성로 129",
    ceoNm: "대표이사",
    code: "00126380",
    createdAt: "2026-07-25T10:00:00+09:00",
    estDt: "1969-01-13",
    hmUrl: "https://www.samsung.com",
    indutyCode: "264",
    info: null,
    name: "삼성전자",
    nameEn: "Samsung Electronics Co., Ltd.",
    updatedAt: "2026-07-26T11:00:00+09:00",
  },
];

async function selectCorporationByName() {
  fireEvent.click(screen.getByRole("combobox", { name: "DART 법인" }));
  fireEvent.change(
    await screen.findByRole("searchbox", { name: "법인 검색" }),
    {
      target: { value: "삼성전자" },
    },
  );
  fireEvent.click(screen.getByRole("option", { name: /삼성전자/ }));
}

describe("KrStockUpsertDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("이름으로 선택한 법인 코드, 상태와 대체 시장을 KR 종목 생성·갱신 API로 전송한다", async () => {
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
        <KrStockUpsertDialog
          corporations={corporations}
          open
          onOpenChange={onOpenChange}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.queryByRole("textbox", { name: "DART 법인 코드" }),
    ).not.toBeInTheDocument();
    await selectCorporationByName();
    fireEvent.change(screen.getByRole("textbox", { name: "종목 코드" }), {
      target: { value: "005930" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "종목 상태" }));
    fireEvent.click(
      screen.getByRole("option", {
        name: "상장 예정 (LISTING_SCHEDULED)",
      }),
    );
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
        status: "LISTING_SCHEDULED",
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
        <KrStockUpsertDialog
          corporations={corporations}
          open
          onOpenChange={onOpenChange}
        />
      </QueryClientProvider>,
    );

    await selectCorporationByName();
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
        status: "ACTIVE",
        stockCode: "005930",
      }),
    );
  });
});
