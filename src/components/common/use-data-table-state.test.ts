import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  type SortableDataTableState,
  type SortableUnpaginatedDataTableState,
  useDataTableState,
  useUnpaginatedDataTableState,
} from "@/components/common/use-data-table-state";

type TestSortField = "name" | "date";

const initialState: SortableDataTableState<TestSortField> = {
  page: 3,
  q: "",
  sortBy: "date",
  sortDirection: "desc",
};

const initialUnpaginatedState: SortableUnpaginatedDataTableState<TestSortField> =
  {
    q: "",
    sortBy: "date",
    sortDirection: "desc",
  };

describe("useDataTableState", () => {
  afterEach(() => {
    cleanup();
  });

  it("검색어 변경 시 첫 페이지로 이동하고 나머지 화면 상태는 유지한다", () => {
    const { result } = renderHook(() => useDataTableState(initialState));

    act(() => result.current.updateQuery("삼성"));

    expect(result.current.state).toEqual({
      page: 1,
      q: "삼성",
      sortBy: "date",
      sortDirection: "desc",
    });
  });

  it("페이지 변경을 URL 이동 없이 로컬 상태에 반영한다", () => {
    const { result } = renderHook(() => useDataTableState(initialState));

    act(() => result.current.updatePage(5));

    expect(result.current.state.page).toBe(5);
  });

  it("페이지 없는 목록의 검색어와 나머지 화면 상태를 유지한다", () => {
    const { result } = renderHook(() =>
      useUnpaginatedDataTableState(initialUnpaginatedState),
    );

    act(() => result.current.updateQuery("삼성"));

    expect(result.current.state).toEqual({
      q: "삼성",
      sortBy: "date",
      sortDirection: "desc",
    });
  });
});
