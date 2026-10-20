import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import {
  createSector,
  updateSector,
} from "@/data-access/queries/sectors/mutations";
import {
  sectorWritePayloadSchema,
  type Sector,
  type SectorFormValues,
} from "@/data-access/schemas/sector";
import { SectorParentSelect } from "@/features/sectors/components/sector-parent-select";
import { getSectorBranchIds } from "@/features/sectors/sector-hierarchy";
import {
  sectorUiActions,
  type SectorEditor,
} from "@/features/sectors/stores/use-sector-ui-store";

interface SectorFormProps {
  editor: SectorEditor;
  initialSector: Sector | undefined;
  sectors: ReadonlyArray<Sector>;
}

export function SectorForm({
  editor,
  initialSector,
  sectors,
}: SectorFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<SectorFormValues>({
    defaultValues: {
      name: initialSector?.name ?? "",
      parentId:
        editor.mode === "create"
          ? editor.parentId
          : (initialSector?.parentId ?? null),
    },
  });
  const mutation = useMutation({
    mutationKey: sectorKeys.writes(),
    mutationFn: (values: SectorFormValues) =>
      editor.mode === "edit"
        ? updateSector({ id: editor.id, ...values })
        : createSector(values),
    onSuccess: async (sector) => {
      queryClient.setQueryData(sectorKeys.detail(sector.id), sector);
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
      sectorUiActions.closeEditor();
    },
  });
  const submit = form.handleSubmit((values) => {
    form.clearErrors();
    const result = sectorWritePayloadSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "parentId")
          form.setError(field, { message: issue.message });
      }
      return;
    }
    if (
      editor.mode === "edit" &&
      result.data.parentId !== null &&
      getSectorBranchIds(sectors, editor.id).has(result.data.parentId)
    ) {
      form.setError("parentId", {
        message: "자기 자신이나 하위 섹터를 상위 섹터로 지정할 수 없습니다.",
      });
      return;
    }
    mutation.mutate(result.data);
  });
  const { errors } = form.formState;
  return (
    <form
      className="flex min-h-0 flex-col gap-4"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="sector-name">섹터명</FieldLabel>
          <Input
            {...form.register("name")}
            aria-invalid={Boolean(errors.name)}
            autoFocus
            disabled={mutation.isPending}
            id="sector-name"
            placeholder="반도체"
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.parentId)}>
          <FieldLabel htmlFor="sector-parent">상위 섹터</FieldLabel>
          <Controller
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <SectorParentSelect
                disabled={mutation.isPending}
                invalid={Boolean(errors.parentId)}
                sectorId={editor.mode === "edit" ? editor.id : null}
                sectors={sectors}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            최상위로 두려면 없음을 선택하세요. 자기 자신과 하위 섹터는 선택할 수
            없습니다.
          </FieldDescription>
          <FieldError errors={[errors.parentId]} />
        </Field>
      </FieldGroup>
      {mutation.isError ? (
        <MutationErrorAlert
          message={getErrorMessage(mutation.error)}
          title="섹터를 저장하지 못했습니다"
        />
      ) : null}
      <DialogFooter>
        <Button
          disabled={mutation.isPending}
          type="button"
          variant="outline"
          onClick={sectorUiActions.closeEditor}
        >
          취소
        </Button>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {mutation.isPending
            ? "저장 중"
            : editor.mode === "create"
              ? "추가"
              : "저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}
