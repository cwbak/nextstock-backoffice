import type { FieldError as FormFieldError } from "react-hook-form";

import { krStockStatusOptions } from "@/components/common/kr-stock-status";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  krStockStatusSchema,
  type KrStockStatus,
} from "@/data-access/schemas/kr-stock";

interface KrStockStatusFieldProps {
  error: FormFieldError | undefined;
  onValueChange: (value: KrStockStatus) => void;
  value: KrStockStatus;
}

export function KrStockStatusField({
  error,
  onValueChange,
  value,
}: KrStockStatusFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="edit-kr-stock-status">종목 상태</FieldLabel>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          const result = krStockStatusSchema.safeParse(nextValue);

          if (result.success) {
            onValueChange(result.data);
          }
        }}
      >
        <SelectTrigger
          aria-invalid={Boolean(error)}
          className="w-full"
          id="edit-kr-stock-status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {krStockStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={[error]} />
    </Field>
  );
}
