import { describe, expect, it } from "vitest";

import {
  backgroundJobSchema,
  corporationsSyncJobRegistrationSchema,
  krStocksKisDailyJobRegistrationSchema,
  krStocksMarketDataAdjustJobRegistrationSchema,
} from "@/data-access/schemas/background-job";

describe("background job schemas", () => {
  it("작업 등록 응답을 검증한다", () => {
    const response = {
      jobId: 42,
      type: "corporations_sync",
      status: "QUEUED",
      statusUrl: "/admin/jobs/42",
      created: true,
      createdAt: "2026-08-13T11:00:00+09:00",
    } as const;

    expect(corporationsSyncJobRegistrationSchema.parse(response)).toEqual(
      response,
    );
  });

  it("진행 중인 작업 응답의 nullable 진행률을 검증한다", () => {
    const response = {
      jobId: 42,
      type: "corporations_sync",
      status: "RUNNING",
      stage: "FETCHING_COMPANIES",
      parameters: {},
      progress: {
        current: 0,
        total: null,
        percent: null,
        succeeded: 0,
        failed: 0,
      },
      result: null,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-13T11:00:00+09:00",
      startedAt: "2026-08-13T11:00:01+09:00",
      finishedAt: null,
      updatedAt: "2026-08-13T11:02:10+09:00",
    } as const;

    expect(backgroundJobSchema.parse(response)).toEqual(response);
  });

  it("KIS 전 종목 일봉 작업 등록 응답을 검증한다", () => {
    const response = {
      jobId: 52,
      type: "stocks_kis_daily",
      status: "RUNNING",
      statusUrl: "/admin/jobs/52",
      created: false,
      createdAt: "2026-08-18T10:00:00+09:00",
    } as const;

    expect(krStocksKisDailyJobRegistrationSchema.parse(response)).toEqual(
      response,
    );
  });

  it("KR 전 종목 수정주가 작업 등록 응답을 검증한다", () => {
    const response = {
      jobId: 53,
      type: "stocks_market_data_adjust",
      status: "QUEUED",
      statusUrl: "/admin/jobs/53",
      created: true,
      createdAt: "2026-08-25T10:00:00+09:00",
    } as const;

    expect(
      krStocksMarketDataAdjustJobRegistrationSchema.parse(response),
    ).toEqual(response);
  });
});
