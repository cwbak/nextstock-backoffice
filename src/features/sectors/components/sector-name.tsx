import type { Sector } from "@/data-access/schemas/sector";
import { SectorStateMarker } from "@/features/sectors/components/sector-state-marker";

export function SectorName({
  sector,
}: {
  sector: Pick<Sector, "name" | "isLeaf" | "isEmpty">;
}) {
  return (
    <span className="flex min-w-0 max-w-full items-center gap-2 text-left">
      {sector.isEmpty ? (
        <SectorStateMarker state="empty" />
      ) : sector.isLeaf ? (
        <SectorStateMarker state="leaf" />
      ) : null}
      <span className="truncate" title={sector.name}>
        {sector.name}
      </span>
    </span>
  );
}
