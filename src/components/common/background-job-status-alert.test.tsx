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
});
