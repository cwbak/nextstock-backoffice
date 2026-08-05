import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { calendarEventsQueryOptions } from "@/data-access/queries/calendar-events/queries";

const listResult = [
  {
    id: 1,
    eventDate: "2026-08-02",
    countryCode: "XX",
    eventType: "INDICATOR",
    title: "OPEC-JMMC 회의",
    titleEn: "OPEC-JMMC Meetings",
    eventTime: null,
    timezone: null,
    importance: "medium",
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
  },
] as const;

describe("calendar event queries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("캘린더 일정 목록을 조회한다", async () => {
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
      queryClient.fetchQuery(calendarEventsQueryOptions),
    ).resolves.toEqual(listResult);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar-events");
  });
});
