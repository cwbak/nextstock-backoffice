import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError as FieldErrorMessage,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface KrStockFallbackListDateFieldProps {
  error: FieldError | undefined;
  registration: UseFormRegisterReturn<"listDd">;
}

export function KrStockFallbackListDateField({
  error,
  registration,
}: KrStockFallbackListDateFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="create-kr-stock-list-date">
        대체 상장일 (선택)
      </FieldLabel>
      <Input
        {...registration}
        aria-invalid={Boolean(error)}
        id="create-kr-stock-list-date"
        type="date"
      />
      <FieldDescription>
        선택 시장의 KIS 상장일이 비어 있을 때만 사용합니다.
      </FieldDescription>
      <FieldErrorMessage errors={[error]} />
    </Field>
  );
}
