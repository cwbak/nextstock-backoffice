import { describe, expect, it } from "vitest";

import {
  holidaySyncPayloadSchema,
  holidaySyncResultSchema,
} from "@/data-access/schemas/holiday";

describe("holiday schemas", () => {
  it("공휴일 동기화 연도 범위를 검증한다", () => {
    const payload = { fromYear: 2020, toYear: 2026 };

    expect(holidaySyncPayloadSchema.parse(payload)).toEqual(payload);
    expect(
      holidaySyncPayloadSchema.safeParse({ fromYear: 2026, toYear: 2020 })
        .success,
    ).toBe(false);
    expect(
      holidaySyncPayloadSchema.safeParse({ fromYear: 999, toYear: 2026 })
        .success,
    ).toBe(false);
  });

  it("공휴일 동기화 완료 결과를 검증한다", () => {
    const result = { fetchedCount: 68, upsertedCount: 68 };

    expect(holidaySyncResultSchema.parse(result)).toEqual(result);
  });
});
