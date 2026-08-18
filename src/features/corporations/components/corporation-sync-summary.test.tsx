import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationSyncSummary } from "@/features/corporations/components/corporation-sync-summary";

describe("CorporationSyncSummary", () => {
  afterEach(cleanup);

  it("DART 법인·법인명 동기화 결과를 표시한다", () => {
    const onClose = vi.fn();

    render(
      <CorporationSyncSummary
        result={{
          corporationFetchedCount: 2_850,
          corporationNameFetchedCount: 108_251,
          corporationNameInsertedCount: 37,
          corporationUpdatedCount: 12,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/DART 법인명 108,251건/)).toBeInTheDocument();
    expect(screen.getByText(/새 이름 37건/)).toBeInTheDocument();
    expect(screen.getByText(/등록된 법인 2,850개/)).toBeInTheDocument();
    expect(screen.getByText(/변경된 12개 법인/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "DART 법인·법인명 동기화 결과 닫기",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
