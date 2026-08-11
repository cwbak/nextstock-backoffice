import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KrMarketDataPeriod } from "@/data-access/schemas/kr-market-data";
import {
  isKrMarketDataPeriod,
  krMarketDataPeriodOptions,
} from "@/features/kr-market-data/kr-market-data-period";

interface KrMarketDataPeriodSelectProps {
  "aria-invalid"?: boolean;
  id: string;
  onValueChange: (value: KrMarketDataPeriod) => void;
  value: KrMarketDataPeriod;
}

export function KrMarketDataPeriodSelect({
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  value,
}: KrMarketDataPeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isKrMarketDataPeriod(nextValue)) {
          onValueChange(nextValue);
        }
      }}
    >
      <SelectTrigger aria-invalid={ariaInvalid} className="w-full" id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {krMarketDataPeriodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
