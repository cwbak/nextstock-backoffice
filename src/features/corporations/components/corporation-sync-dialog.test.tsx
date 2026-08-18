import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { CorporationSyncDialog } from "@/features/corporations/components/corporation-sync-dialog";

describe("CorporationSyncDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("DART 법인 전체 동기화를 실행하고 법인 캐시를 갱신한다", async () => {
    const result = {
      corporationFetchedCount: 2_850,
      corporationUpdatedCount: 12,
    };
    const registration = {
      jobId: 42,
      type: "corporations_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/42",
      created: true,
      createdAt: "2026-08-13T11:00:00+09:00",
    };
    const completedJob = {
      jobId: 42,
      type: "corporations_sync",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {},
      progress: {
        current: 2_850,
        total: 2_850,
        percent: 100,
        succeeded: 2_850,
        failed: 0,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-13T11:00:00+09:00",
      startedAt: "2026-08-13T11:00:01+09:00",
      finishedAt: "2026-08-13T11:05:00+09:00",
      updatedAt: "2026-08-13T11:05:00+09:00",
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
        <CorporationSyncDialog
          open
          onOpenChange={vi.fn()}
          onSynced={onSynced}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/실제 값이 변경된 법인만 일괄 갱신/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: corporationKeys.all,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations/sync");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/42");
  });
});
