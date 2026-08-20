import type { FieldError as FormFieldError } from "react-hook-form";

import { CorporationCombobox } from "@/components/common/corporation-combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { Corporation } from "@/data-access/schemas/corporation";

interface KrStockCorporationFieldProps {
  corporations: ReadonlyArray<Corporation>;
  error: FormFieldError | undefined;
  onValueChange: (value: string) => void;
  value: string;
}

export function KrStockCorporationField({
  corporations,
  error,
  onValueChange,
  value,
}: KrStockCorporationFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="create-corporation-code">DART 법인</FieldLabel>
      <CorporationCombobox
        aria-invalid={Boolean(error)}
        corporations={corporations}
        id="create-corporation-code"
        value={value}
        onValueChange={onValueChange}
      />
      <FieldDescription>
        등록된 법인을 이름으로 검색해 선택합니다.
      </FieldDescription>
      <FieldError errors={[error]} />
    </Field>
  );
}
