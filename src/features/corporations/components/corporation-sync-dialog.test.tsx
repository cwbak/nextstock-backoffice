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

  it("DART 법인명 동기화를 실행하고 법인 캐시를 갱신한다", async () => {
    const result = {
      corporationNameFetchedCount: 108_251,
      corporationNameInsertedCount: 37,
      corporationUpdatedCount: 2,
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
        <CorporationSyncDialog
          open
          onOpenChange={vi.fn()}
          onSynced={onSynced}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/법인명 원장에 추가합니다/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: corporationKeys.all,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations/sync");
  });
});
