import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { krxCalendarEarningsQueryOptions } from "@/data-access/queries/calendar-earnings/queries";

const listResult = [
  {
    code: "001740",
    name: "SK네트웍스",
    marketType: "KOSPI",
    marketCap: null,
    reportDate: "2026-08-14",
    reportTime: "14:00",
  },
  {
    code: "294570",
    name: "쿠콘",
    marketType: "KOSDAQ",
    marketCap: null,
    reportDate: "2026-08-20",
    reportTime: null,
  },
] as const;

describe("KRX calendar earning queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("KRX 실적 일정 목록을 조회한다", async () => {
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
      queryClient.fetchQuery(krxCalendarEarningsQueryOptions),
    ).resolves.toEqual(listResult);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar-earnings/krx");
  });
});
