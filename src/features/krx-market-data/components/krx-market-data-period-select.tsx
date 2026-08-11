import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KrxMarketDataPeriod } from "@/data-access/schemas/krx-market-data";
import {
  isKrxMarketDataPeriod,
  krxMarketDataPeriodOptions,
} from "@/features/krx-market-data/krx-market-data-period";

interface KrxMarketDataPeriodSelectProps {
  "aria-invalid"?: boolean;
  id: string;
  onValueChange: (value: KrxMarketDataPeriod) => void;
  value: KrxMarketDataPeriod;
}

export function KrxMarketDataPeriodSelect({
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  value,
}: KrxMarketDataPeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isKrxMarketDataPeriod(nextValue)) {
          onValueChange(nextValue);
        }
      }}
    >
      <SelectTrigger aria-invalid={ariaInvalid} className="w-full" id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {krxMarketDataPeriodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
