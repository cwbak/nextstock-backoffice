import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KrStockSyncSummary } from "@/features/kr-stocks/components/kr-stock-sync-summary";

describe("KrStockSyncSummary", () => {
  afterEach(cleanup);

  it("KRX와 DART 동기화 결과를 함께 표시한다", () => {
    const onClose = vi.fn();

    render(
      <KrStockSyncSummary
        result={{
          corporationNameFetchedCount: 108_251,
          corporationNameInsertedCount: 37,
          corporationUpdatedCount: 2,
          fetchedCount: 2_785,
          updatedCount: 12,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/KRX KOSPI·KOSDAQ 2,785건/)).toBeInTheDocument();
    expect(screen.getByText(/DART 법인명 108,251건/)).toBeInTheDocument();
    expect(screen.getByText(/새 이름 37건/)).toBeInTheDocument();
    expect(screen.getByText(/변경된 2개 법인/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "KR 종목·법인명 동기화 결과 닫기",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
