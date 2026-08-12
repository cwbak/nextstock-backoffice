import { describe, expect, it } from "vitest";

import { navigationItems } from "@/features/shell/navigation-items";

describe("navigationItems", () => {
  it("요청한 LNB 순서로 메뉴를 표시한다", () => {
    expect(navigationItems.map(({ label, to }) => ({ label, to }))).toEqual([
      { label: "US 종목 정보", to: "/us-stocks" },
      { label: "출자현황", to: "/corporation-investments" },
      { label: "법인", to: "/corporations" },
      { label: "주식", to: "/listed-stocks" },
      { label: "KR 캔들", to: "/kr-market-data" },
      { label: "테마 리스팅", to: "/themes" },
      { label: "일정", to: "/calendar-events" },
      { label: "실적(US)", to: "/calendar-earnings-us" },
      { label: "실적(KR)", to: "/calendar-earnings-kr" },
    ]);
  });
});
