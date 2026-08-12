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
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { KrStockSyncDialog } from "@/features/kr-stocks/components/kr-stock-sync-dialog";

describe("KrStockSyncDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("KRX·DART 동기화를 실행하고 결과를 전달한다", async () => {
    const result = {
      corporationNameFetchedCount: 108_251,
      corporationNameInsertedCount: 37,
      corporationUpdatedCount: 2,
      fetchedCount: 2_785,
      updatedCount: 12,
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(result), {
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

    expect(screen.getByText(/추가하지 않습니다/)).toBeInTheDocument();
    expect(screen.getByText(/DART 고유번호의 새 법인명/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: corporationKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krStockKeys.all,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/kr-stocks/sync");
  });

  it("DART 단계가 실패하면 부분 반영된 KR 종목 캐시를 갱신한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: "dart corporation codes lookup failed" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 502,
        },
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <KrStockSyncDialog open onOpenChange={vi.fn()} onSynced={vi.fn()} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    expect(
      await screen.findByText("DART 고유번호를 조회하지 못했습니다."),
    ).toBeInTheDocument();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: krStockKeys.all,
    });
  });
});
