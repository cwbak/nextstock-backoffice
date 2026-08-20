import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Corporation } from "@/data-access/schemas/corporation";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import { KrStocksTable } from "@/features/kr-stocks/components/kr-stocks-table";

const corporation: Corporation = {
  accMt: 12,
  address: "경기도 수원시 영통구 삼성로 129",
  ceoNm: "한종희",
  code: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  estDt: "1969-01-13",
  hmUrl: "https://www.samsung.com/sec",
  indutyCode: "264",
  info: {
    product: ["반도체"],
    summary: ["전자제품 제조"],
  },
  name: "삼성전자",
  nameEn: "Samsung Electronics",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

const krStock: KrStock = {
  code: "005930",
  corporationCode: corporation.code,
  createdAt: "2026-07-25T10:00:00+09:00",
  listDd: "1975-06-11",
  listShrs: 5_969_782_550,
  marketType: "KOSPI",
  name: "삼성전자",
  parval: 100,
  status: "ACTIVE",
  stockType: "보통주",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

describe("KrStocksTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("종목 상태를 표시하고 행·종목명 상세 및 수정 동작을 제공한다", () => {
    const onEdit = vi.fn();
    const onSort = vi.fn();
    const onView = vi.fn();

    render(
      <KrStocksTable
        corporationsByCode={new Map([[corporation.code, corporation]])}
        krStocks={[krStock]}
        onEdit={onEdit}
        onSort={onSort}
        onView={onView}
        sortBy="name"
        sortDirection="asc"
      />,
    );

    expect(screen.getByText("1975. 6. 11.")).toBeInTheDocument();
    expect(screen.getByText("정상")).toBeInTheDocument();
    expect(screen.getByText("보통주")).toBeInTheDocument();
    expect(screen.getByText("100원")).toBeInTheDocument();
    expect(screen.getByText("5,969,782,550주")).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "종목명 내림차순 정렬" })
        .closest("th"),
    ).toHaveAttribute("aria-sort", "ascending");
    fireEvent.click(
      screen.getByRole("button", { name: "상장일 오름차순 정렬" }),
    );
    expect(onSort).toHaveBeenCalledWith("listDd");

    const row = screen.getByText(krStock.code).closest("tr");

    expect(row).not.toBeNull();
    fireEvent.click(row!);
    expect(onView).toHaveBeenLastCalledWith(corporation);

    fireEvent.click(
      screen.getByRole("button", {
        name: `${krStock.name} 연결 기업 상세 보기`,
      }),
    );
    expect(onView).toHaveBeenCalledTimes(2);

    fireEvent.click(
      screen.getByRole("button", { name: `${krStock.name} 수정` }),
    );
    expect(onEdit).toHaveBeenCalledWith(krStock);
    expect(onView).toHaveBeenCalledTimes(2);
    expect(
      screen.queryByRole("button", { name: `${krStock.name} 삭제` }),
    ).not.toBeInTheDocument();
  });

  it("연결 기업을 찾지 못한 종목은 상세 동작을 제공하지 않는다", () => {
    const onView = vi.fn();

    render(
      <KrStocksTable
        corporationsByCode={new Map()}
        krStocks={[krStock]}
        onEdit={vi.fn()}
        onSort={vi.fn()}
        onView={onView}
        sortBy={null}
        sortDirection="asc"
      />,
    );

    fireEvent.click(screen.getByText(krStock.code).closest("tr")!);

    expect(onView).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", {
        name: `${krStock.name} 연결 기업 상세 보기`,
      }),
    ).not.toBeInTheDocument();
  });
});
