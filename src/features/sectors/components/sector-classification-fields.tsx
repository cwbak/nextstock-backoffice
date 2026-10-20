import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { Sector, SectorFormValues } from "@/data-access/schemas/sector";
import { SectorDepthSelect } from "@/features/sectors/components/sector-depth-select";
import { SectorParentSelect } from "@/features/sectors/components/sector-parent-select";
import {
  sectorDepthLabels,
  sectorParentDepths,
} from "@/features/sectors/sector-depth";

interface SectorClassificationFieldsProps {
  depthLocked: boolean;
  disabled: boolean;
  form: UseFormReturn<SectorFormValues>;
  sectorId: number | null;
  sectors: ReadonlyArray<Sector>;
}

export function SectorClassificationFields({
  depthLocked,
  disabled,
  form,
  sectorId,
  sectors,
}: SectorClassificationFieldsProps) {
  const depth = useWatch({ control: form.control, name: "depth" });
  const parentDepth = sectorParentDepths[depth];
  const { errors } = form.formState;

  return (
    <>
      <Field data-invalid={Boolean(errors.depth)}>
        <FieldLabel htmlFor="sector-depth">분류</FieldLabel>
        <Controller
          control={form.control}
          name="depth"
          render={({ field }) => (
            <SectorDepthSelect
              disabled={disabled || depthLocked}
              invalid={Boolean(errors.depth)}
              value={field.value}
              onValueChange={(next) => {
                field.onChange(next);
                form.setValue("parentId", null, { shouldDirty: true });
                form.clearErrors(["depth", "parentId"]);
              }}
            />
          )}
        />
        <FieldDescription id="sector-depth-description">
          {depthLocked
            ? "하위 섹터가 있어 분류를 변경할 수 없습니다."
            : "대분류 → 중분류 → 소분류 순서로 구성합니다."}
        </FieldDescription>
        <FieldError errors={[errors.depth]} />
      </Field>
      <Field data-invalid={Boolean(errors.parentId)}>
        <FieldLabel htmlFor="sector-parent">상위 섹터</FieldLabel>
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <SectorParentSelect
              depth={depth}
              disabled={disabled}
              invalid={Boolean(errors.parentId)}
              sectorId={sectorId}
              sectors={sectors}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <FieldDescription id="sector-parent-description">
          {parentDepth === null
            ? "대분류는 상위 섹터 없이 등록됩니다."
            : `${sectorDepthLabels[parentDepth]} 섹터를 선택해 주세요. 자기 자신과 하위 섹터는 선택할 수 없습니다.`}
        </FieldDescription>
        <FieldError errors={[errors.parentId]} />
      </Field>
    </>
  );
}
