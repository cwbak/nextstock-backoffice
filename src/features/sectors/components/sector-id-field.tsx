import { Controller, type UseFormReturn } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SectorFormValues } from "@/data-access/schemas/sector";

export function SectorIdField({
  disabled,
  form,
  mode,
}: {
  disabled: boolean;
  form: UseFormReturn<SectorFormValues>;
  mode: "create" | "edit";
}) {
  const error = form.formState.errors.id;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="sector-id">섹터 ID</FieldLabel>
      <Controller
        control={form.control}
        name="id"
        render={({ field }) => (
          <Input
            {...field}
            aria-describedby="sector-id-description"
            aria-invalid={Boolean(error)}
            autoFocus={mode === "create"}
            autoComplete="off"
            disabled={disabled}
            id="sector-id"
            inputMode="numeric"
            min={1}
            max={2_147_483_647}
            step={1}
            placeholder="42"
            readOnly={mode === "edit"}
            type="number"
            value={field.value || ""}
            onChange={(event) =>
              field.onChange(
                event.currentTarget.value
                  ? Number(event.currentTarget.value)
                  : 0,
              )
            }
          />
        )}
      />
      <FieldDescription id="sector-id-description">
        {mode === "edit"
          ? "ID는 변경할 수 없습니다."
          : "1~2,147,483,647 사이의 정수 ID를 입력하세요. 생성 후 변경할 수 없습니다."}
      </FieldDescription>
      <FieldError errors={[error]} />
    </Field>
  );
}
