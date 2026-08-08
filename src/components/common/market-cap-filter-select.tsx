import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isMarketCapFilter,
  marketCapFilterOptions,
  type MarketCapFilter,
} from "@/lib/market-cap";

interface MarketCapFilterSelectProps {
  onValueChange: (value: MarketCapFilter) => void;
  value: MarketCapFilter;
}

export function MarketCapFilterSelect({
  onValueChange,
  value,
}: MarketCapFilterSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isMarketCapFilter(nextValue)) {
          onValueChange(nextValue);
        }
      }}
    >
      <SelectTrigger aria-label="시가총액 필터" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {marketCapFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
