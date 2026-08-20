import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  corporationClassSchema,
  type CorporationClass,
} from "@/data-access/schemas/corporation";

const corporationClassOptions = [
  { label: "KOSPI (Y)", value: "Y" },
  { label: "KOSDAQ (K)", value: "K" },
] as const;

interface CorporationClassSelectProps {
  "aria-invalid"?: boolean;
  id: string;
  onValueChange: (value: CorporationClass) => void;
  value: CorporationClass | undefined;
}

export function CorporationClassSelect({
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  value,
}: CorporationClassSelectProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(nextValue) => {
        const result = corporationClassSchema.safeParse(nextValue);

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
