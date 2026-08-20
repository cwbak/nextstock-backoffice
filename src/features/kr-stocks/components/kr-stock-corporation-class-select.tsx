import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  krStockCorporationClassSchema,
  type KrStockCorporationClass,
} from "@/data-access/schemas/kr-stock";

const corporationClassOptions = [
  { label: "KOSPI (Y)", value: "Y" },
  { label: "KOSDAQ (K)", value: "K" },
] as const;

interface KrStockCorporationClassSelectProps {
  "aria-invalid"?: boolean;
  id: string;
  onValueChange: (value: KrStockCorporationClass) => void;
  value: KrStockCorporationClass | undefined;
}

export function KrStockCorporationClassSelect({
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  value,
}: KrStockCorporationClassSelectProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(nextValue) => {
        const result = krStockCorporationClassSchema.safeParse(nextValue);

        if (result.success) {
          onValueChange(result.data);
        }
      }}
    >
      <SelectTrigger aria-invalid={ariaInvalid} className="w-full" id={id}>
        <SelectValue placeholder="선택 안 함" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {corporationClassOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
