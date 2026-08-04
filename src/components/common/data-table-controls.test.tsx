import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableToolbar } from "@/components/common/data-table-controls";

describe("DataTableToolbar", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("한글 조합 중에는 현재 글자로 필터링하고 조합 완료 후 검색 상태를 반영한다", async () => {
    vi.useFakeTimers();
    const onFilterChange = vi.fn();
    const onQueryChange = vi.fn();

    render(
      <DataTableToolbar
        label="법인 검색"
        onFilterChange={onFilterChange}
        placeholder="검색"
        query=""
        onQueryChange={onQueryChange}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "법인 검색" });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "삼" } });

    await act(() => vi.advanceTimersByTime(249));

    expect(onQueryChange).not.toHaveBeenCalled();
    expect(onFilterChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("삼");

    await act(() => vi.advanceTimersByTime(1));

    expect(onFilterChange).toHaveBeenCalledOnce();
    expect(onFilterChange).toHaveBeenCalledWith("삼");
    expect(onQueryChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    await act(() => vi.advanceTimersByTime(249));

    expect(onQueryChange).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(1));

    expect(onQueryChange).toHaveBeenCalledOnce();
    expect(onQueryChange).toHaveBeenCalledWith("삼");
  });

  it("결과가 없는 조합 중 검색어를 지워 확정 검색어로 돌아가면 필터를 복원한다", async () => {
    vi.useFakeTimers();
    const onFilterChange = vi.fn();
    const onQueryChange = vi.fn();

    render(
      <DataTableToolbar
        label="법인 검색"
        onFilterChange={onFilterChange}
        placeholder="검색"
        query="주식회"
        onQueryChange={onQueryChange}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "법인 검색" });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "주식회샤" } });
    await act(() => vi.advanceTimersByTime(250));

    expect(onFilterChange).toHaveBeenLastCalledWith("주식회샤");

    fireEvent.change(input, { target: { value: "주식회" } });
    await act(() => vi.advanceTimersByTime(250));

    expect(onFilterChange).toHaveBeenLastCalledWith("주식회");
    expect(onQueryChange).not.toHaveBeenCalled();
  });
});
