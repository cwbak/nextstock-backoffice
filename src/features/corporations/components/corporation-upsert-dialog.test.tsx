import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationUpsertDialog } from "@/features/corporations/components/corporation-upsert-dialog";

const corporation = {
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

describe("CorporationUpsertDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("법인 코드를 검증해 법인 생성·갱신 API로 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(corporation), {
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
        <CorporationUpsertDialog open onOpenChange={onOpenChange} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "DART 법인 코드" }), {
      target: { value: "00126380" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
  });
});
