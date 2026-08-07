import { describe, expect, it } from "vitest";

import { navigationItems } from "@/features/shell/navigation-items";

describe("navigationItems", () => {
  it("일정 메뉴를 주식 다음에 표시한다", () => {
    expect(navigationItems.map(({ label, to }) => ({ label, to }))).toEqual([
      { label: "나스닥 정보", to: "/nasdaqs" },
      { label: "법인", to: "/corporations" },
      { label: "출자현황", to: "/corporation-investments" },
      { label: "주식", to: "/listed-stocks" },
      { label: "일정", to: "/calendar-events" },
      { label: "실적", to: "/calendar-earnings" },
    ]);
  });
});
