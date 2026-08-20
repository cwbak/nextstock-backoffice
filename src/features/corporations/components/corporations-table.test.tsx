import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Corporation } from "@/data-access/schemas/corporation";
import { CorporationsTable } from "@/features/corporations/components/corporations-table";

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

describe("CorporationsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("행과 법인명으로 상세를 열고 수정·삭제 클릭은 상세 열기로 전파하지 않는다", () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const onSort = vi.fn();
    const onView = vi.fn();

    render(
      <CorporationsTable
        corporations={[corporation]}
        onDelete={onDelete}
        onEdit={onEdit}
        onSort={onSort}
        onView={onView}
        resetKey=""
        sortBy="estDt"
        sortDirection="desc"
      />,
    );

    const establishedDateHeader = screen
      .getByRole("button", { name: "설립일 오름차순 정렬" })
      .closest("th");

    expect(establishedDateHeader).toHaveAttribute("aria-sort", "descending");
    expect(screen.queryByText("상장일")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "법인명 오름차순 정렬" }),
    );
    expect(onSort).toHaveBeenCalledWith("name");

    const corporationCode = screen.getByText("00126380");
    const row = corporationCode.closest("tr");

    expect(row).not.toBeNull();
    fireEvent.click(row!);
    expect(onView).toHaveBeenLastCalledWith(corporation);

    fireEvent.click(screen.getByRole("button", { name: "삼성전자 상세 보기" }));
    expect(onView).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "삼성전자 수정" }));
    expect(onEdit).toHaveBeenCalledWith(corporation);
    expect(onView).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "삼성전자 삭제" }));
    expect(onDelete).toHaveBeenCalledWith(corporation);
    expect(onView).toHaveBeenCalledTimes(2);
  });

  it("전체 건수는 유지하면서 보이는 범위의 행만 렌더링한다", () => {
    const corporations = Array.from({ length: 100 }, (_, index) => ({
      ...corporation,
      code: index.toString().padStart(8, "0"),
      name: `법인 ${index}`,
    }));

    const { rerender } = render(
      <CorporationsTable
        corporations={corporations}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onSort={vi.fn()}
        onView={vi.fn()}
        resetKey=""
        sortBy={null}
        sortDirection="asc"
      />,
    );

    const scrollRegion = screen.getByRole("region", {
      name: "등록된 법인 목록",
    });

    expect(scrollRegion).toHaveAttribute("tabindex", "0");
    expect(scrollRegion.parentElement).toHaveClass("h-full", "min-h-0");
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "101");

    const renderedRows = screen.getAllByRole("row").slice(1);

    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(corporations.length);
    expect(screen.getByText("00000000")).toBeInTheDocument();
    expect(screen.queryByText("00000099")).not.toBeInTheDocument();

    scrollRegion.scrollTop = 56 * 80;
    fireEvent.scroll(scrollRegion);

    expect(screen.getByText("00000080")).toBeInTheDocument();
    expect(screen.queryByText("00000000")).not.toBeInTheDocument();

    rerender(
      <CorporationsTable
        corporations={corporations}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onSort={vi.fn()}
        onView={vi.fn()}
        resetKey="filtered"
        sortBy={null}
        sortDirection="asc"
      />,
    );

    expect(scrollRegion.scrollTop).toBe(0);
  });
});
