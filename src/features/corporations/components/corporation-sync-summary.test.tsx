import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationSyncSummary } from "@/features/corporations/components/corporation-sync-summary";

describe("CorporationSyncSummary", () => {
  afterEach(cleanup);

  it("DART 법인 전체 동기화 결과를 표시한다", () => {
    const onClose = vi.fn();

    render(
      <CorporationSyncSummary
        result={{
          corporationFetchedCount: 2_850,
          corporationUpdatedCount: 12,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/등록된 법인 2,850개/)).toBeInTheDocument();
    expect(screen.getByText(/변경된 12개 법인/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "DART 법인 전체 동기화 결과 닫기",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
