import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KrMarketDataStatisticsDialog } from "@/features/kr-market-data/components/kr-market-data-statistics-dialog";

describe("KrMarketDataStatisticsDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("KR 전 종목 수정주가 통계 작업을 등록하고 완료 결과를 반영한다", async () => {
    const result = {
      stockCount: 2_800,
      storedCount: 2_800,
    };
    const registration = {
      jobId: 54,
      type: "stocks_market_data_statistics_generate",
      status: "QUEUED",
      statusUrl: "/admin/jobs/54",
      created: true,
      createdAt: "2026-08-30T10:00:00+09:00",
    };
    const completedJob = {
      jobId: 54,
      type: "stocks_market_data_statistics_generate",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {},
      progress: {
        current: 2_800,
        total: 2_800,
        percent: 100,
        succeeded: 2_800,
        failed: 0,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-30T10:00:00+09:00",
      startedAt: "2026-08-30T10:00:01+09:00",
      finishedAt: "2026-08-30T10:03:00+09:00",
      updatedAt: "2026-08-30T10:03:00+09:00",
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
    const onGenerated = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <KrMarketDataStatisticsDialog
          open
          onGenerated={onGenerated}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "수정주가 통계 반영" }));

    await waitFor(() => expect(onGenerated).toHaveBeenCalledWith(result));
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/market-data/statistics",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/54");
  });
});
