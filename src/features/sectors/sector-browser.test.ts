import { describe, expect, it } from "vitest";

import type { Sector } from "@/data-access/schemas/sector";
import {
  filterSectorRows,
  getSectorDepthRows,
  getSectorBrowserColumns,
} from "@/features/sectors/sector-browser";
import { buildSectorRows } from "@/features/sectors/sector-hierarchy";

const sectors: Sector[] = [
  { id: 1, name: "기술", depth: "major", parentId: null, isLeaf: false },
  { id: 2, name: "반도체", depth: "middle", parentId: 1, isLeaf: false },
  { id: 3, name: "장비", depth: "minor", parentId: 2, isLeaf: false },
  { id: 4, name: "금융", depth: "major", parentId: null, isLeaf: false },
  { id: 5, name: "은행", depth: "middle", parentId: 4, isLeaf: false },
];
const rows = buildSectorRows(sectors);

describe("sector browser", () => {
  it("개별 분류는 같은 depth만 섹터명 순서로 정렬한다", () => {
    expect(
      getSectorDepthRows(rows, "middle").map(({ sector }) => sector.name),
    ).toEqual(["반도체", "은행"]);
    expect(
      filterSectorRows(rows, "major").map(({ sector }) => sector.id),
    ).toEqual([4, 1]);
  });
  it("선택하지 않으면 대분류만 표시하고 순서대로 하위를 연다", () => {
    const initial = getSectorBrowserColumns(rows, rows, null, null);
    expect(initial.majorRows.map(({ sector }) => sector.id)).toEqual([4, 1]);
    expect(initial.middleRows).toEqual([]);
    expect(initial.minorRows).toEqual([]);
    const selected = getSectorBrowserColumns(rows, rows, 1, 2);
    expect(selected.middleRows.map(({ sector }) => sector.id)).toEqual([2]);
    expect(selected.minorRows.map(({ sector }) => sector.id)).toEqual([3]);
  });

  it("소분류 검색 결과의 조상도 탐색할 수 있도록 남긴다", () => {
    const matches = filterSectorRows(rows, "장비");
    expect(matches.map(({ sector }) => sector.id)).toEqual([3]);
    const result = getSectorBrowserColumns(rows, matches, 1, 2);
    expect(result.majorRows.map(({ sector }) => sector.id)).toEqual([1]);
    expect(result.middleRows.map(({ sector }) => sector.id)).toEqual([2]);
    expect(result.minorRows.map(({ sector }) => sector.id)).toEqual([3]);
  });

  it("부모 변경·삭제·검색으로 선택 경로가 무효하면 이전 하위를 표시하지 않는다", () => {
    const changedParent = getSectorBrowserColumns(rows, rows, 4, 2);
    expect(changedParent.middle?.id).toBeUndefined();
    expect(changedParent.minorRows).toEqual([]);
    const removedRows = rows.filter(({ sector }) => sector.id !== 1);
    expect(
      getSectorBrowserColumns(removedRows, removedRows, 1, 2).middleRows,
    ).toEqual([]);
    expect(
      getSectorBrowserColumns(rows, filterSectorRows(rows, "은행"), 1, 2)
        .minorRows,
    ).toEqual([]);
  });
});
