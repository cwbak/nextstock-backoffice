import { describe, expect, it } from "vitest";
import type { Sector } from "@/data-access/schemas/sector";

import {
  buildSectorRows,
  getSectorBranchIds,
} from "@/features/sectors/sector-hierarchy";

const sectors: Sector[] = [
  { id: 3, name: "장비", depth: "minor", parentId: 2 },
  { id: 2, name: "반도체", depth: "middle", parentId: 1 },
  { id: 4, name: "금융", depth: "major", parentId: null },
  { id: 1, name: "기술", depth: "major", parentId: null },
];

describe("sector hierarchy", () => {
  it("정렬되지 않은 응답에서 계층별 순서·경로·전체 하위 수를 계산한다", () => {
    const rows = buildSectorRows(sectors);
    expect(rows.map(({ sector }) => sector.id)).toEqual([4, 1, 2, 3]);
    expect(rows.find(({ sector }) => sector.id === 3)?.path).toEqual([
      "기술",
      "반도체",
      "장비",
    ]);
    expect(rows.find(({ sector }) => sector.id === 1)?.descendantCount).toBe(2);
  });

  it("삭제 범위와 부모 선택 제외 범위에 모든 깊이의 하위를 포함한다", () => {
    expect([...getSectorBranchIds(sectors, 1)].sort()).toEqual([1, 2, 3]);
    expect([...getSectorBranchIds(sectors, 4)]).toEqual([4]);
  });
});
