import { useState } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RetainedWorkspace } from "@/features/shell/components/retained-workspace";

describe("RetainedWorkspace", () => {
  afterEach(cleanup);

  it("방문 전에는 페이지를 렌더하지 않고 방문 후에는 입력 상태를 유지한다", () => {
    const renderPage = vi.fn();

    function Page() {
      renderPage();
      const [value, setValue] = useState("");

      return (
        <input
          aria-label="테스트 검색"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      );
    }

    const workspace = (active: boolean) => (
      <RetainedWorkspace active={active} label="테스트" name="Test workspace">
        <Page />
      </RetainedWorkspace>
    );
    const { rerender } = render(workspace(false));

    expect(renderPage).not.toHaveBeenCalled();

    rerender(workspace(true));
    const input = screen.getByRole("textbox", { name: "테스트 검색" });
    fireEvent.change(input, { target: { value: "검색 유지" } });

    rerender(workspace(false));
    expect(input).not.toBeVisible();

    rerender(workspace(true));
    expect(screen.getByRole("textbox", { name: "테스트 검색" })).toBe(input);
    expect(input).toHaveValue("검색 유지");
  });
});
