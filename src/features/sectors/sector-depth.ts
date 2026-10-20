import type { SectorDepth } from "@/data-access/schemas/sector";

export const sectorDepthLabels = {
  major: "대분류",
  middle: "중분류",
  minor: "소분류",
} satisfies Record<SectorDepth, string>;

export const sectorParentDepths = {
  major: null,
  middle: "major",
  minor: "middle",
} satisfies Record<SectorDepth, SectorDepth | null>;

export function getChildSectorDepth(depth: SectorDepth): SectorDepth | null {
  return depth === "major" ? "middle" : depth === "middle" ? "minor" : null;
}
