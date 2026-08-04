import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { equityInvestmentsQueryOptions } from "@/data-access/queries/equity-investments/queries";

const listResult = [
  {
    corpCode: "00126380",
    invName: "삼성디스플레이",
    invListed: true,
    bsnsYear: 2026,
    status: "OK",
    invstmntPurps: "경영참여",
    trmendBlceQotaRt: "84.80",
  },
] as const;

describe("equity investment queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("새 지분투자 목록 경로에서 응답을 조회한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(listResult), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery(equityInvestmentsQueryOptions),
    ).resolves.toEqual(listResult);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/equity_investments");
  });
});
