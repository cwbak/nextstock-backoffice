import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { NasdaqInfo } from "@/data-access/schemas/nasdaq-info";
import { NasdaqInfoTable } from "@/features/nasdaq-info/components/nasdaq-info-table";

const items: ReadonlyArray<NasdaqInfo> = [
  {
    symbol: "A",
    name: "Agilent Technologies Inc. Common Stock",
    marketCap: "39314526605.00",
    country: "United States",
    ipoYear: 1999,
    sector: "Industrials",
    industry: "Biotechnology: Laboratory Analytical Instruments",
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T11:00:00+09:00",
  },
  {
    symbol: "TEST",
    name: "Test Inc.",
    marketCap: null,
    country: null,
    ipoYear: null,
    sector: null,
    industry: null,
    createdAt: "2026-08-05T10:00:00+09:00",
    updatedAt: "2026-08-05T10:00:00+09:00",
  },
];

describe("NasdaqInfoTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("NASDAQ 종목 필드와 nullable 값을 표시한다", () => {
    render(<NasdaqInfoTable items={items} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(
      screen.getByText("Agilent Technologies Inc. Common Stock"),
    ).toBeInTheDocument();
    expect(screen.getByText("$39,314,526,605.00")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(5);
  });
});
