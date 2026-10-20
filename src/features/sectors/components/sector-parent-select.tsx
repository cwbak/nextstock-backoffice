import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sector } from "@/data-access/schemas/sector";
import {
  buildSectorRows,
  getSectorBranchIds,
} from "@/features/sectors/sector-hierarchy";

interface SectorParentSelectProps {
  disabled: boolean;
  invalid: boolean;
  onValueChange: (value: number | null) => void;
  sectorId: number | null;
  sectors: ReadonlyArray<Sector>;
  value: number | null;
}

export function SectorParentSelect({
  disabled,
  invalid,
  onValueChange,
  sectorId,
  sectors,
  value,
}: SectorParentSelectProps) {
  const options = useMemo(() => {
    const excluded =
      sectorId === null
        ? new Set<number>()
        : getSectorBranchIds(sectors, sectorId);
    return buildSectorRows(sectors).filter(
      ({ sector }) => !excluded.has(sector.id),
    );
  }, [sectorId, sectors]);

  return (
    <Select
      disabled={disabled}
      value={value === null ? "root" : String(value)}
      onValueChange={(next) =>
        onValueChange(next === "root" ? null : Number(next))
      }
    >
      <SelectTrigger
        aria-invalid={invalid}
        className="w-full"
        id="sector-parent"
      >
        <SelectValue placeholder="상위 섹터를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="root">없음 (최상위 섹터)</SelectItem>
          {options.map(({ sector, path }) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {path.join(" › ")} (#{sector.id})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
