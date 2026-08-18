import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { backgroundJobsQueryOptions } from "@/data-access/queries/background-jobs/queries";

describe("background job queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("지정한 개수만큼 최근 작업 목록을 조회한다", async () => {
    const response = { jobs: [] };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery(backgroundJobsQueryOptions(25)),
    ).resolves.toEqual(response);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/jobs?limit=25");
  });
});
