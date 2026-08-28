import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HolidaySyncDialog } from "@/features/calendar-events/components/holiday-sync-dialog";

describe("HolidaySyncDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("연도 범위로 공휴일 동기화 작업을 실행하고 완료 결과를 전달한다", async () => {
    const result = { fetchedCount: 68, upsertedCount: 68 };
    const registration = {
      jobId: 55,
      type: "holidays_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/55",
      created: true,
      createdAt: "2026-08-28T10:00:00+09:00",
    };
    const completedJob = {
      jobId: 55,
      type: "holidays_sync",
      status: "COMPLETED",
      stage: "COMPLETED",
      parameters: { fromYear: 2020, toYear: 2026 },
      progress: {
        current: 84,
        total: 84,
        percent: 100,
        succeeded: 84,
        failed: 0,
      },
      result,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-28T10:00:00+09:00",
      startedAt: "2026-08-28T10:00:01+09:00",
      finishedAt: "2026-08-28T10:01:24+09:00",
      updatedAt: "2026-08-28T10:01:24+09:00",
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
    render(
      <QueryClientProvider client={queryClient}>
        <HolidaySyncDialog open onOpenChange={vi.fn()} onSynced={onSynced} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("시작 연도"), {
      target: { value: "2020" },
    });
    fireEvent.change(screen.getByLabelText("종료 연도"), {
      target: { value: "2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "공휴일 동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar/holidays/sync");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/admin/jobs/55");
  });

  it("종료 연도가 시작 연도보다 빠르면 요청하지 않는다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <HolidaySyncDialog open onOpenChange={vi.fn()} onSynced={vi.fn()} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("시작 연도"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText("종료 연도"), {
      target: { value: "2020" },
    });
    fireEvent.click(screen.getByRole("button", { name: "공휴일 동기화" }));

    expect(
      await screen.findByText("종료 연도는 시작 연도보다 빠를 수 없습니다."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
