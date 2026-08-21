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
import { CorporationInvestmentsBulkCreateDialog } from "@/features/corporation-investments/components/corporation-investments-bulk-create-dialog";

describe("CorporationInvestmentsBulkCreateDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("전체 법인 작업을 등록하고 완료 결과로 지분투자 캐시를 갱신한다", async () => {
    const result = {
      corporationCount: 2_400,
      processedCount: 2_398,
      failedCount: 2,
      fetchedCount: 1_200,
      upsertedCount: 1_100,
    };
    const registration = {
      jobId: 43,
      type: "equity_investments_all",
      status: "QUEUED",
      statusUrl: "/admin/jobs/43",
      created: true,
      createdAt: "2026-08-13T11:00:00+09:00",
    };
    const completedJob = {
      jobId: 43,
      type: "equity_investments_all",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: {},
      progress: {
        current: 2_400,
        total: 2_400,
        percent: 100,
        succeeded: 2_398,
        failed: 2,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-13T11:00:00+09:00",
      startedAt: "2026-08-13T11:00:01+09:00",
      finishedAt: "2026-08-13T11:10:00+09:00",
      updatedAt: "2026-08-13T11:10:00+09:00",
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
        <CorporationInvestmentsBulkCreateDialog
          corporationCount={2_400}
          open
          onCreated={onCreated}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByLabelText("사업연도")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("보고서 구분")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "전체 동기화" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: equityInvestmentKeys.all,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/equity_investments/all");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/43");
  });
});
