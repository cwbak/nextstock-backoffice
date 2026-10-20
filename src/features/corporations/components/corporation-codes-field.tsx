import type { UseFormRegisterReturn } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface CorporationCodesFieldProps {
  disabled: boolean;
  errorMessage: string | undefined;
  registration: UseFormRegisterReturn<"codes">;
}

export function CorporationCodesField({
  disabled,
  errorMessage,
  registration,
}: CorporationCodesFieldProps) {
  return (
    <Field data-disabled={disabled} data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor="upsert-corporation-codes">DART 법인 코드</FieldLabel>
      <Textarea
        aria-describedby="upsert-corporation-codes-description upsert-corporation-codes-error"
        aria-invalid={Boolean(errorMessage)}
        className="max-h-64"
        disabled={disabled}
        id="upsert-corporation-codes"
        placeholder={"00126380\n00164779"}
        rows={4}
        {...registration}
      />
      <FieldDescription id="upsert-corporation-codes-description">
        숫자 8자리 코드를 줄바꿈, 쉼표 또는 공백으로 구분해 입력해 주세요.
      </FieldDescription>
      <FieldError id="upsert-corporation-codes-error">
        {errorMessage}
      </FieldError>
    </Field>
  );
}
