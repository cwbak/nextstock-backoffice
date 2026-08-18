import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { EquityInvestment } from "@/data-access/schemas/equity-investment";
import { CorporationInvestmentsTable } from "@/features/corporation-investments/components/corporation-investments-table";

const investments: ReadonlyArray<EquityInvestment> = [
  {
    corpCode: "00126380",
    invName: "삼성디스플레이",
    bsnsYear: 2026,
    status: "OK",
    invstmntPurps: "경영참여",
    trmendBlceQotaRt: "84.80",
  },
  {
    corpCode: "00126380",
    invName: "비상장기업",
    bsnsYear: 2025,
    status: "OK",
    invstmntPurps: null,
    trmendBlceQotaRt: null,
  },
];

describe("CorporationInvestmentsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("투자 대상과 사업연도, 상태, 출자목적, 지분율을 표시한다", () => {
    render(
      <CorporationInvestmentsTable
        corporationsByCode={new Map()}
        investments={investments}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: "출자목적" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "사업연도" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "상태" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2026년")).toBeInTheDocument();
    expect(screen.getAllByText("OK")).toHaveLength(2);
    expect(screen.getByText("삼성디스플레이")).toBeInTheDocument();
    expect(screen.getByText("비상장기업")).toBeInTheDocument();
    expect(screen.getByText("경영참여")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
    expect(screen.getByText("84.80%")).toBeInTheDocument();
  });
});
