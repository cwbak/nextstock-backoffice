import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { KrStockSyncDialog } from "@/features/kr-stocks/components/kr-stock-sync-dialog";

describe("KrStockSyncDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("KRX 동기화를 실행하고 결과를 전달한다", async () => {
    const result = {
      fetchedCount: 2_785,
      updatedCount: 12,
    };
    const registration = {
      jobId: 44,
      type: "kr_stocks_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/44",
      created: true,
      createdAt: "2026-08-13T11:00:00+09:00",
    };
    const completedJob = {
      jobId: 44,
      type: "kr_stocks_sync",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {},
      progress: {
        current: 3,
        total: 3,
        percent: 100,
        succeeded: 3,
        failed: 0,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-13T11:00:00+09:00",
      startedAt: "2026-08-13T11:00:01+09:00",
      finishedAt: "2026-08-13T11:00:10+09:00",
      updatedAt: "2026-08-13T11:00:10+09:00",
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
    const onSynced = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <KrStockSyncDialog open onOpenChange={vi.fn()} onSynced={onSynced} />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/새로 추가하지 않습니다/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krStockKeys.all,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks/sync");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/44");
  });
});
