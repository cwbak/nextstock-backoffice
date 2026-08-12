import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationSyncSummary } from "@/features/corporations/components/corporation-sync-summary";

describe("CorporationSyncSummary", () => {
  afterEach(cleanup);

  it("DART 법인명 동기화 결과를 표시한다", () => {
    const onClose = vi.fn();

    render(
      <CorporationSyncSummary
        result={{
          corporationNameFetchedCount: 108_251,
          corporationNameInsertedCount: 37,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/DART 법인명 108,251건/)).toBeInTheDocument();
    expect(screen.getByText(/새 이름 37건/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "DART 법인명 동기화 결과 닫기",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
