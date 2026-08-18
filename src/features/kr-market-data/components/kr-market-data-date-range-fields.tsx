import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import {
  Field,
  FieldError as FieldErrors,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface KrMarketDataDateRangeFieldsProps {
  fromError: FieldError | undefined;
  fromRegistration: UseFormRegisterReturn<"from">;
  idPrefix: string;
  toError: FieldError | undefined;
  toRegistration: UseFormRegisterReturn<"to">;
}

export function KrMarketDataDateRangeFields({
  fromError,
  fromRegistration,
  idPrefix,
  toError,
  toRegistration,
}: KrMarketDataDateRangeFieldsProps) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field data-invalid={Boolean(fromError)}>
        <FieldLabel htmlFor={`${idPrefix}-from`}>시작일</FieldLabel>
        <Input
          {...fromRegistration}
          aria-invalid={Boolean(fromError)}
          id={`${idPrefix}-from`}
          type="date"
        />
        <FieldErrors errors={[fromError]} />
      </Field>
      <Field data-invalid={Boolean(toError)}>
        <FieldLabel htmlFor={`${idPrefix}-to`}>종료일</FieldLabel>
        <Input
          {...toRegistration}
          aria-invalid={Boolean(toError)}
          id={`${idPrefix}-to`}
          type="date"
        />
        <FieldErrors errors={[toError]} />
      </Field>
    </FieldGroup>
  );
}
