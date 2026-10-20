import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { corporationKeys } from "@/data-access/queries/corporations/keys";
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

function renderDialog() {
  const onOpenChange = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  queryClient.setQueryData(corporationKeys.list(), []);

  render(
    <QueryClientProvider client={queryClient}>
      <CorporationUpsertDialog open onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  );

  return { onOpenChange, queryClient };
}

describe("CorporationUpsertDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([
    { codes: ["00126380"], input: "00126380" },
    {
      codes: ["00126380", "00164779", "00401731"],
      input: " 00126380,\n00164779\t00401731 ",
    },
  ])(
    "법인 코드 입력 $input을 배열로 한 번에 전송하고 목록을 갱신한다",
    async ({ codes, input }) => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify(codes.map((code) => ({ ...corporation, code }))),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      );
      const { onOpenChange, queryClient } = renderDialog();

      fireEvent.change(
        screen.getByRole("textbox", { name: "DART 법인 코드" }),
        {
          target: { value: input },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: "저장" }));

      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations");
      expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
      expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
        JSON.stringify({ codes }),
      );
      expect(
        queryClient.getQueryState(corporationKeys.list())?.isInvalidated,
      ).toBe(true);
    },
  );

  it.each([
    {
      input: " , \n\t ",
      message: "법인 코드를 하나 이상 입력해 주세요.",
    },
    {
      input: "00126380\n123",
      message: "법인 코드는 숫자 8자리여야 합니다.",
    },
  ])(
    "유효하지 않은 입력 $input은 전송하지 않는다",
    async ({ input, message }) => {
      const fetchMock = vi.spyOn(globalThis, "fetch");
      const { onOpenChange, queryClient } = renderDialog();
      const field = screen.getByRole("textbox", { name: "DART 법인 코드" });

      fireEvent.change(field, { target: { value: input } });
      fireEvent.click(screen.getByRole("button", { name: "저장" }));

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(field).toHaveAttribute("aria-invalid", "true");
      expect(fetchMock).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(
        queryClient.getQueryState(corporationKeys.list())?.isInvalidated,
      ).toBe(false);
    },
  );

  it("저장 중 입력을 잠그고 실패하면 입력을 유지하며 부분 저장된 목록을 갱신한다", async () => {
    let completeRequest: ((response: Response) => void) | undefined;
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve;
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValueOnce(response);
    const { onOpenChange, queryClient } = renderDialog();
    const field = screen.getByRole("textbox", { name: "DART 법인 코드" });
    const input = "00126380\n00164779";

    fireEvent.change(field, { target: { value: input } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    const saveButton = await screen.findByRole("button", { name: /저장 중/ });
    expect(saveButton).toBeDisabled();
    expect(field).toBeDisabled();
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    fireEvent.click(saveButton);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      completeRequest?.(
        new Response(JSON.stringify({ error: "dart company lookup failed" }), {
          headers: { "Content-Type": "application/json" },
          status: 502,
        }),
      );
      await response;
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "DART 기업개황을 조회하지 못했습니다.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "오류 전에 처리된 법인은 저장되었을 수 있습니다.",
    );
    expect(field).toHaveValue(input);
    expect(field).toBeEnabled();
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      queryClient.getQueryState(corporationKeys.list())?.isInvalidated,
    ).toBe(true);
  });
});
