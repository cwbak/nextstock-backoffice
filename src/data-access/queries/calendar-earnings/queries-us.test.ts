import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

const listResult = [
  {
    symbol: "ACIU",
    name: "AC Immune SA",
    marketCap: null,
    isSp500: false,
    reportDate: "2026-08-04",
    reportTime: null,
  },
  {
    symbol: "ACAD",
    name: "Acadia Pharmaceuticals Inc",
    marketCap: "1945000000.00",
    isSp500: true,
    reportDate: "2026-08-04",
    reportTime: "22:30",
  },
] as const;

describe("calendar earning queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("실적 일정 목록을 조회한다", async () => {
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
      queryClient.fetchQuery(usCalendarEarningsQueryOptions),
    ).resolves.toEqual(listResult);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar-earnings/us");
  });
});
