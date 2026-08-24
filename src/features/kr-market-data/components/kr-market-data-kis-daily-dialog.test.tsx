import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import { KrMarketDataKisDailyDialog } from "@/features/kr-market-data/components/kr-market-data-kis-daily-dialog";

describe("KrMarketDataKisDailyDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("KIS 전 종목 작업을 등록하고 완료 결과를 반영한다", async () => {
    const result = {
      from: "2026-01-01",
      to: "2026-08-10",
      stockCount: 2_800,
      processedCount: 2_798,
      failedCount: 2,
      fetchedCount: 420_000,
      insertedCount: 420_000,
    };
    const registration = {
      jobId: 52,
      type: "stocks_kis_daily",
      status: "QUEUED",
      statusUrl: "/admin/jobs/52",
      created: true,
      createdAt: "2026-08-18T10:00:00+09:00",
    };
    const completedJob = {
      jobId: 52,
      type: "stocks_kis_daily",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {
        adjusted: false,
        from: "2026-01-01",
        to: "2026-08-10",
      },
      progress: {
        current: 2_800,
        total: 2_800,
        percent: 100,
        succeeded: 2_798,
        failed: 2,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-18T10:00:00+09:00",
      startedAt: "2026-08-18T10:00:01+09:00",
      finishedAt: "2026-08-18T10:30:00+09:00",
      updatedAt: "2026-08-18T10:30:00+09:00",
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(registration), {
          headers: { "Content-Type": "application/json" },
          status: 202,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(completedJob), {
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
        <KrMarketDataKisDailyDialog
          open
          onCreated={onCreated}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("시작일"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("종료일"), {
      target: { value: "2026-08-10" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "주가 기준" }));
    fireEvent.click(await screen.findByRole("option", { name: "원주가" }));
    fireEvent.click(screen.getByRole("button", { name: "KIS 전 종목 저장" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krMarketDataKeys.lists(),
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/market-data/kis-daily",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        from: "2026-01-01",
        to: "2026-08-10",
        adjusted: false,
      }),
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/52");
  });
});
