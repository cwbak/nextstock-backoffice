import { z } from "zod";

import {
  sectorDepthSchema,
  type SectorDepth,
} from "@/data-access/schemas/sector";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";

export const sectorViewSchema = z.enum(["all", ...sectorDepthSchema.options]);
export type SectorView = z.infer<typeof sectorViewSchema>;

const sectorCollator = new Intl.Collator("ko-KR");

export function getSectorDepthRows(
  rows: ReadonlyArray<SectorRow>,
  depth: SectorDepth,
) {
  return rows
    .filter(({ sector }) => sector.depth === depth)
    .sort(
      (a, b) =>
        sectorCollator.compare(a.sector.name, b.sector.name) ||
        a.sector.id - b.sector.id,
    );
}

export function filterSectorRows(
  rows: ReadonlyArray<SectorRow>,
  query: string,
) {
  const keyword = query.trim().toLocaleLowerCase("ko-KR");
  return keyword
    ? rows.filter(({ sector, path }) =>
        `${sector.id} ${sector.depth} ${sectorDepthLabels[sector.depth]} ${path.join(" ")}`
          .toLocaleLowerCase("ko-KR")
          .includes(keyword),
      )
    : rows;
}

export function getSectorBrowserColumns(
  rows: ReadonlyArray<SectorRow>,
  matches: ReadonlyArray<SectorRow>,
  majorId: number | null,
  middleId: number | null,
) {
  const visibleIds = new Set(
    matches.flatMap(({ sector, ancestorIds }) => [sector.id, ...ancestorIds]),
  );
  const majorRows = rows.filter(
    ({ sector }) => sector.depth === "major" && visibleIds.has(sector.id),
  );
  const major = majorRows.find(({ sector }) => sector.id === majorId)?.sector;
  const middleRows = major
    ? rows.filter(
        ({ sector }) =>
          sector.depth === "middle" &&
          sector.parentId === major.id &&
          visibleIds.has(sector.id),
      )
    : [];
  const middle = middleRows.find(
    ({ sector }) => sector.id === middleId,
  )?.sector;
  const minorRows = middle
    ? rows.filter(
        ({ sector }) =>
          sector.depth === "minor" &&
          sector.parentId === middle.id &&
          visibleIds.has(sector.id),
      )
    : [];
  return { major, majorRows, middle, middleRows, minorRows };
}
