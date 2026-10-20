import { Badge } from "@/components/ui/badge";
import type { SectorDepth } from "@/data-access/schemas/sector";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";

export function SectorDepthBadge({ depth }: { depth: SectorDepth }) {
  return (
    <Badge variant={depth === "major" ? "secondary" : "outline"}>
      {sectorDepthLabels[depth]}
    </Badge>
  );
}
