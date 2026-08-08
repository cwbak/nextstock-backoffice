import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isSp500Filter,
  sp500FilterOptions,
  type Sp500Filter,
} from "@/lib/sp500";

interface Sp500FilterSelectProps {
  onValueChange: (value: Sp500Filter) => void;
  value: Sp500Filter;
}

export function Sp500FilterSelect({
  onValueChange,
  value,
}: Sp500FilterSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isSp500Filter(nextValue)) {
          onValueChange(nextValue);
        }
      }}
    >
      <SelectTrigger aria-label="S&P 500 필터" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {sp500FilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
