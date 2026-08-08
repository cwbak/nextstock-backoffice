import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { calendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

const listResult = [
  {
    key: "ACIU",
    stockType: "NASDAQ",
    name: "AC Immune SA",
    marketCap: null,
    reportDate: "2026-08-04",
    reportTime: null,
  },
  {
    key: "ACAD",
    stockType: "NASDAQ",
    name: "Acadia Pharmaceuticals Inc",
    marketCap: "1945000000.00",
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
      queryClient.fetchQuery(calendarEarningsQueryOptions),
    ).resolves.toEqual(listResult);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar-earnings");
  });
});
