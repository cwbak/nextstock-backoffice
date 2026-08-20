import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KrStockSyncSummary } from "@/features/kr-stocks/components/kr-stock-sync-summary";

describe("KrStockSyncSummary", () => {
  afterEach(cleanup);

  it("KRX 동기화 결과를 표시한다", () => {
    const onClose = vi.fn();

    render(
      <KrStockSyncSummary
        result={{
          fetchedCount: 2_785,
          updatedCount: 12,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/KOSPI·KOSDAQ 2,785건/)).toBeInTheDocument();
    expect(
      screen.getByText(/정보 또는 상태가 변경된 12개/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "KRX 동기화 결과 닫기",
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
