import { afterEach, describe, expect, it } from "vitest";

import { useShellStore } from "@/features/shell/stores/use-shell-store";

describe("useShellStore", () => {
  afterEach(() => {
    useShellStore.getState().setMobileNavigationOpen(false);
    useShellStore.getState().setTheme("light");
    localStorage.clear();
  });

  it("테마를 DOM과 저장소에 함께 적용한다", () => {
    useShellStore.getState().setTheme("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem("stock-note-theme")).toBe("dark");
  });

  it("모바일 내비게이션 상태를 변경한다", () => {
    useShellStore.getState().setMobileNavigationOpen(true);

    expect(useShellStore.getState().mobileNavigationOpen).toBe(true);
  });
});
