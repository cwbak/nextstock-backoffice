import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationSyncDialog } from "@/features/corporations/components/corporation-sync-dialog";

describe("CorporationSyncDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("DART 법인명 동기화를 실행한다", async () => {
    const result = {
      corporationNameFetchedCount: 108_251,
      corporationNameInsertedCount: 37,
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
      screen.getByText(/등록된 법인 기본정보는 변경하지 않습니다/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "동기화" }));

    await waitFor(() => expect(onSynced).toHaveBeenCalledWith(result));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/corporations/sync");
  });
});
