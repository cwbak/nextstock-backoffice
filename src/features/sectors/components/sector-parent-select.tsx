import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sector, SectorDepth } from "@/data-access/schemas/sector";
import {
  sectorDepthLabels,
  sectorParentDepths,
} from "@/features/sectors/sector-depth";
import {
  buildSectorRows,
  getSectorBranchIds,
} from "@/features/sectors/sector-hierarchy";

interface SectorParentSelectProps {
  depth: SectorDepth;
  disabled: boolean;
  invalid: boolean;
  onValueChange: (value: number | null) => void;
  sectorId: number | null;
  sectors: ReadonlyArray<Sector>;
  value: number | null;
}

function SectorParentOptionsEmptyState({ depth }: { depth: SectorDepth }) {
  return (
    <p className="px-3 py-2 text-sm text-muted-foreground" role="status">
      선택할 수 있는 {sectorDepthLabels[depth]} 섹터가 없습니다. 먼저 해당
      분류의 섹터를 추가해 주세요.
    </p>
  );
}

export function SectorParentSelect({
  depth,
  disabled,
  invalid,
  onValueChange,
  sectorId,
  sectors,
  value,
}: SectorParentSelectProps) {
  const parentDepth = sectorParentDepths[depth];
  const options = useMemo(() => {
    const excluded =
      sectorId === null
        ? new Set<number>()
        : getSectorBranchIds(sectors, sectorId);
    return buildSectorRows(sectors).filter(
      ({ sector }) =>
        sector.depth === sectorParentDepths[depth] && !excluded.has(sector.id),
    );
  }, [depth, sectorId, sectors]);

  return (
    <Select
      disabled={disabled || depth === "major"}
      value={depth === "major" ? "root" : value === null ? "" : String(value)}
      onValueChange={(next) =>
        onValueChange(depth === "major" || next === "" ? null : Number(next))
      }
    >
      <SelectTrigger
        aria-describedby="sector-parent-description"
        aria-invalid={invalid}
        className="w-full"
        id="sector-parent"
      >
        <SelectValue placeholder="상위 섹터를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {depth === "major" ? (
            <SelectItem value="root">없음 (대분류)</SelectItem>
          ) : null}
          {options.map(({ sector, path }) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {path.join(" › ")} (#{sector.id})
            </SelectItem>
          ))}
          {parentDepth !== null && options.length === 0 ? (
            <SectorParentOptionsEmptyState depth={parentDepth} />
          ) : null}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
