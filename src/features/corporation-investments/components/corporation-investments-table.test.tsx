import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { EquityInvestment } from "@/data-access/schemas/equity-investment";
import { CorporationInvestmentsTable } from "@/features/corporation-investments/components/corporation-investments-table";

const investments: ReadonlyArray<EquityInvestment> = [
  {
    corpCode: "00126380",
    invName: "삼성디스플레이",
    trmendBlceQotaRt: "84.80",
  },
  {
    corpCode: "00126380",
    invName: "비상장기업",
    trmendBlceQotaRt: null,
  },
];

describe("CorporationInvestmentsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("투자 대상과 지분율을 표시한다", () => {
    render(
      <CorporationInvestmentsTable
        corporationsByCode={new Map()}
        investments={investments}
      />,
    );

    expect(
      screen.queryByRole("columnheader", { name: "사업연도" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "상태" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("삼성디스플레이")).toBeInTheDocument();
    expect(screen.getByText("비상장기업")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("84.80%")).toBeInTheDocument();
  });
});
