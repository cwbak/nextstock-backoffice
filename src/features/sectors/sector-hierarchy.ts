import type { Sector } from "@/data-access/schemas/sector";

export interface SectorRow {
  sector: Sector;
  path: string[];
  ancestorIds: number[];
  descendantCount: number;
}

const sectorCollator = new Intl.Collator("ko-KR");

export function getSectorBranchIds(sectors: ReadonlyArray<Sector>, id: number) {
  const children = new Map<number, number[]>();
  for (const sector of sectors) {
    if (sector.parentId !== null) {
      const siblings = children.get(sector.parentId);
      if (siblings) siblings.push(sector.id);
      else children.set(sector.parentId, [sector.id]);
    }
  }
  const ids = new Set<number>();
  const pending = [id];
  while (pending.length) {
    const current = pending.pop();
    if (current === undefined || ids.has(current)) continue;
    ids.add(current);
    pending.push(...(children.get(current) ?? []));
  }
  return ids;
}

export function buildSectorRows(sectors: ReadonlyArray<Sector>): SectorRow[] {
  const sorted = [...sectors].sort(
    (first, second) =>
      sectorCollator.compare(first.name, second.name) || first.id - second.id,
  );
  const byId = new Map(sectors.map((sector) => [sector.id, sector]));
  const children = new Map<number | null, Sector[]>();
  for (const sector of sorted) {
    const parentId =
      sector.parentId !== null && byId.has(sector.parentId)
        ? sector.parentId
        : null;
    const siblings = children.get(parentId);
    if (siblings) siblings.push(sector);
    else children.set(parentId, [sector]);
  }
  const rows: SectorRow[] = [];
  const visited = new Set<number>();
  const appendBranch = (root: Sector) => {
    const pending: Array<{
      sector: Sector;
      path: string[];
      ancestorIds: number[];
    }> = [{ sector: root, path: [], ancestorIds: [] }];
    while (pending.length) {
      const current = pending.pop();
      if (!current || visited.has(current.sector.id)) continue;
      visited.add(current.sector.id);
      const path = [...current.path, current.sector.name];
      rows.push({
        sector: current.sector,
        path,
        ancestorIds: current.ancestorIds,
        descendantCount: 0,
      });
      for (const child of [
        ...(children.get(current.sector.id) ?? []),
      ].reverse()) {
        pending.push({
          sector: child,
          path,
          ancestorIds: [...current.ancestorIds, current.sector.id],
        });
      }
    }
  };
  for (const root of children.get(null) ?? []) appendBranch(root);
  for (const sector of sorted)
    if (!visited.has(sector.id)) appendBranch(sector);
  const counts = new Map<number, number>();
  for (const row of rows) {
    for (const ancestorId of row.ancestorIds)
      counts.set(ancestorId, (counts.get(ancestorId) ?? 0) + 1);
  }
  for (const row of rows) row.descendantCount = counts.get(row.sector.id) ?? 0;
  return rows;
}
