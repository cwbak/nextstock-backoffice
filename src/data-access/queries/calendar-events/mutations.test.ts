import { afterEach, describe, expect, it, vi } from "vitest";

import { syncHolidays } from "@/data-access/queries/calendar-events/mutations";

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

describe("calendar event mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("선택한 연도 범위로 공휴일 동기화를 요청한다", async () => {
    const registration = {
      jobId: 55,
      type: "holidays_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/55",
      created: true,
      createdAt: "2026-08-28T10:00:00+09:00",
    } as const;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(registration), {
        headers: { "Content-Type": "application/json" },
        status: 202,
      }),
    );

    await expect(
      syncHolidays({ fromYear: 2020, toYear: 2026 }),
    ).resolves.toEqual(registration);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/calendar/holidays/sync");
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      fromYear: 2020,
      toYear: 2026,
    });
  });
});
