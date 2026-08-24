import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KrMarketDataAdjustedFieldProps {
  className?: string;
  disabled?: boolean;
  id: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

export function KrMarketDataAdjustedField({
  className,
  disabled = false,
  id,
  onValueChange,
  value,
}: KrMarketDataAdjustedFieldProps) {
  const descriptionId = `${id}-description`;

  return (
    <Field className={className} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>주가 기준</FieldLabel>
      <Select
        disabled={disabled}
        value={value ? "adjusted" : "original"}
        onValueChange={(nextValue) => {
          if (nextValue === "adjusted" || nextValue === "original") {
            onValueChange(nextValue === "adjusted");
          }
        }}
      >
        <SelectTrigger
          aria-describedby={descriptionId}
          className="w-full"
          id={id}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectItem value="adjusted">수정주가</SelectItem>
            <SelectItem value="original">원주가</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription id={descriptionId}>
        수정주가는 market_data_adj, 원주가는 market_data에 저장합니다.
      </FieldDescription>
    </Field>
  );
}
