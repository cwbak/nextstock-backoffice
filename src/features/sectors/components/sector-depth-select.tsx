import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sectorDepthSchema,
  type SectorDepth,
} from "@/data-access/schemas/sector";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";

interface SectorDepthSelectProps {
  disabled: boolean;
  invalid: boolean;
  onValueChange: (depth: SectorDepth) => void;
  value: SectorDepth;
}

export function SectorDepthSelect({
  disabled,
  invalid,
  onValueChange,
  value,
}: SectorDepthSelectProps) {
  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={(next) => onValueChange(sectorDepthSchema.parse(next))}
    >
      <SelectTrigger
        aria-describedby="sector-depth-description"
        aria-invalid={invalid}
        className="w-full"
        id="sector-depth"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sectorDepthSchema.options.map((depth) => (
            <SelectItem key={depth} value={depth}>
              {sectorDepthLabels[depth]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
