import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BackgroundJobStatusAlert } from "@/components/common/background-job-status-alert";
import type { BackgroundJob } from "@/data-access/schemas/background-job";

describe("BackgroundJobStatusAlert", () => {
  afterEach(cleanup);

  it("전 종목 수정주가 작업의 처리 단계를 구분해 표시한다", () => {
    const job: BackgroundJob = {
      jobId: 53,
      type: "stocks_market_data_adjust",
      status: "RUNNING",
      stage: "PROCESSING_STOCKS",
      parameters: {},
      progress: {
        current: 100,
        total: 2_800,
        percent: 3.6,
        succeeded: 99,
        failed: 1,
      },
      result: null,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-25T10:00:00+09:00",
      startedAt: "2026-08-25T10:00:01+09:00",
      finishedAt: null,
      updatedAt: "2026-08-25T10:01:00+09:00",
    };

    render(<BackgroundJobStatusAlert job={job} jobId={job.jobId} />);

    expect(screen.getByText(/KR 종목별 수정주가 반영/)).toBeInTheDocument();
    expect(
      screen.queryByText(/KR 종목별 KIS 일봉 처리/),
    ).not.toBeInTheDocument();
  });

  it("공휴일 동기화 단계를 사용자용 문구로 표시한다", () => {
    const job: BackgroundJob = {
      jobId: 55,
      type: "holidays_sync",
      status: "RUNNING",
      stage: "SYNCING_HOLIDAYS",
      parameters: { fromYear: 2026, toYear: 2026 },
      progress: {
        current: 3,
        total: 12,
        percent: 25,
        succeeded: 3,
        failed: 0,
      },
      result: null,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-28T10:00:00+09:00",
      startedAt: "2026-08-28T10:00:01+09:00",
      finishedAt: null,
      updatedAt: "2026-08-28T10:00:03+09:00",
    };

    render(<BackgroundJobStatusAlert job={job} jobId={job.jobId} />);

    expect(screen.getByText(/공휴일 조회 및 저장/)).toBeInTheDocument();
  });

  it.each([
    ["CALCULATING_STATISTICS", "수정주가 통계 계산"],
    ["STORING_STATISTICS", "수정주가 통계 저장"],
  ])("수정주가 통계 단계 %s를 사용자용 문구로 표시한다", (stage, label) => {
    const job: BackgroundJob = {
      jobId: 54,
      type: "stocks_market_data_statistics_generate",
      status: "RUNNING",
      stage,
      parameters: {},
      progress: {
        current: 1_400,
        total: 2_800,
        percent: 50,
        succeeded: 1_400,
        failed: 0,
      },
      result: null,
      error: null,
      attemptCount: 1,
      createdAt: "2026-08-30T10:00:00+09:00",
      startedAt: "2026-08-30T10:00:01+09:00",
      finishedAt: null,
      updatedAt: "2026-08-30T10:01:00+09:00",
    };

    render(<BackgroundJobStatusAlert job={job} jobId={job.jobId} />);

    expect(screen.getByText(new RegExp(label))).toBeInTheDocument();
  });
});
