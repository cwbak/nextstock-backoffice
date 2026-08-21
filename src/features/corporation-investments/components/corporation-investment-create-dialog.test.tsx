import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { equityInvestmentKeys } from "@/data-access/queries/equity-investments/keys";
import type { Corporation } from "@/data-access/schemas/corporation";
import { CorporationInvestmentCreateDialog } from "@/features/corporation-investments/components/corporation-investment-create-dialog";

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

describe("CorporationInvestmentCreateDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("선택한 법인 코드만 전송하고 출자현황 캐시를 갱신한다", async () => {
    const result = {
      corpCode: corporation.code,
      fetchedCount: 12,
      upsertedCount: 12,
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const onCreated = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <CorporationInvestmentCreateDialog
          corporations={[corporation]}
          open
          onCreated={onCreated}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByLabelText("사업연도")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("보고서 구분")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox", { name: "동기화 법인" }));
    fireEvent.click(await screen.findByRole("option", { name: /삼성전자/ }));
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: equityInvestmentKeys.all,
    });
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe("POST");
    const requestBody = request?.body;

    if (typeof requestBody !== "string") {
      throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
    }
    expect(JSON.parse(requestBody) as unknown).toEqual({
      corpCode: corporation.code,
    });
  });
});
