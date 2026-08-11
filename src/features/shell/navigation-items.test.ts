import { describe, expect, it } from "vitest";

import { navigationItems } from "@/features/shell/navigation-items";

describe("navigationItems", () => {
  it("KRX 일봉과 테마 리스팅 메뉴를 주식과 일정 사이에 표시한다", () => {
    expect(navigationItems.map(({ label, to }) => ({ label, to }))).toEqual([
      { label: "나스닥 정보", to: "/nasdaqs" },
      { label: "법인", to: "/corporations" },
      { label: "출자현황", to: "/corporation-investments" },
      { label: "주식", to: "/listed-stocks" },
      { label: "KRX 일봉", to: "/krx-market-data" },
      { label: "테마 리스팅", to: "/themes" },
      { label: "일정", to: "/calendar-events" },
      { label: "실적(NASDAQ)", to: "/calendar-earnings" },
      { label: "실적(KRX)", to: "/calendar-earnings-krx" },
    ]);
  });
});
