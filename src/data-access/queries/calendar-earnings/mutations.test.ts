import { afterEach, describe, expect, it, vi } from "vitest";

import { createUsCalendarEarnings } from "@/data-access/queries/calendar-earnings/mutations";

const result = {
  fetchedCount: 1_200,
  insertedCount: 350,
  skippedCount: 850,
} as const;

describe("calendar earning mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("요청 본문 없이 US 실적 일정 추가를 요청한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    await expect(createUsCalendarEarnings()).resolves.toEqual(result);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar-earnings/us");
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe("POST");
    expect(request?.body).toBeUndefined();
  });
});
