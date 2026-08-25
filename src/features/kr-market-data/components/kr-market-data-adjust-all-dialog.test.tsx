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
import { KrMarketDataAdjustAllDialog } from "@/features/kr-market-data/components/kr-market-data-adjust-all-dialog";

describe("KrMarketDataAdjustAllDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("KR 전 종목 수정주가 작업을 등록하고 완료 결과를 반영한다", async () => {
    const result = {
      stockCount: 2_800,
      processedCount: 2_798,
      failedCount: 2,
      copiedCount: 15_000,
      adjustedCount: 420_000,
    };
    const registration = {
      jobId: 53,
      type: "stocks_market_data_adjust",
      status: "QUEUED",
      statusUrl: "/admin/jobs/53",
      created: true,
      createdAt: "2026-08-25T10:00:00+09:00",
    };
    const completedJob = {
      jobId: 53,
      type: "stocks_market_data_adjust",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {},
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
      createdAt: "2026-08-25T10:00:00+09:00",
      startedAt: "2026-08-25T10:00:01+09:00",
      finishedAt: "2026-08-25T10:30:00+09:00",
      updatedAt: "2026-08-25T10:30:00+09:00",
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
    const onAdjusted = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <KrMarketDataAdjustAllDialog
          open
          onAdjusted={onAdjusted}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "전체 수정주가 반영" }));

    await waitFor(() => expect(onAdjusted).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krMarketDataKeys.lists(),
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/admin/stocks/market-data/adjust",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/53");
  });
});
