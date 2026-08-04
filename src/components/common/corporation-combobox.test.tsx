import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporationCombobox } from "@/components/common/corporation-combobox";
import type { Corporation } from "@/data-access/schemas/corporation";

const corporations = Array.from({ length: 2_650 }, (_, index): Corporation => ({
  accMt: 12,
  address: `테스트 주소 ${index}`,
  ceoNm: `대표자 ${index}`,
  code: String(index).padStart(8, "0"),
  createdAt: "2026-07-26T10:00:00+09:00",
  estDt: "2000-01-01",
  hmUrl: null,
  info: null,
  indutyCode: "100",
  name: `테스트 법인 ${index}`,
  nameEn: `Test Corporation ${index}`,
  updatedAt: "2026-07-26T10:00:00+09:00",
}));

describe("CorporationCombobox", () => {
  afterEach(() => {
    cleanup();
  });

  it("대량 법인 목록을 숨은 option으로 만들지 않고 50개만 표시한다", async () => {
    render(
      <>
        <label htmlFor="corporation-picker">연결 법인</label>
        <CorporationCombobox
          corporations={corporations}
          id="corporation-picker"
          value="00000000"
          onValueChange={vi.fn()}
        />
      </>,
    );

    expect(document.querySelectorAll("option")).toHaveLength(0);

    fireEvent.click(screen.getByRole("combobox", { name: "연결 법인" }));

    expect(
      await screen.findByRole("listbox", { name: "법인 검색 결과" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(50);
    expect(document.querySelectorAll("option")).toHaveLength(0);
  });
});
