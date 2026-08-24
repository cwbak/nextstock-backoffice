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
  description: string;
  disabled?: boolean;
  id: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

export function KrMarketDataAdjustedField({
  className,
  description,
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
            <SelectItem value="original">원본주가</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription id={descriptionId}>{description}</FieldDescription>
    </Field>
  );
}
