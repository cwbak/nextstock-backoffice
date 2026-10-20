import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
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
  sectorCreatePayloadSchema,
  type Sector,
  type SectorFormValues,
} from "@/data-access/schemas/sector";
import { SectorClassificationFields } from "@/features/sectors/components/sector-classification-fields";
import { SectorIdField } from "@/features/sectors/components/sector-id-field";
import {
  getChildSectorDepth,
  sectorDepthLabels,
  sectorParentDepths,
} from "@/features/sectors/sector-depth";
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
  const parent =
    editor.mode === "create"
      ? sectors.find((sector) => sector.id === editor.parentId)
      : undefined;
  const depthLocked =
    editor.mode === "edit" &&
    sectors.some((sector) => sector.parentId === editor.id);
  const form = useForm<SectorFormValues>({
    defaultValues: {
      id: editor.mode === "edit" ? editor.id : 0,
      name: initialSector?.name ?? "",
      depth:
        initialSector?.depth ??
        (parent ? getChildSectorDepth(parent.depth) : null) ??
        "major",
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
        ? updateSector({ ...values, id: editor.id })
        : createSector(values),
    onSuccess: async (sector) => {
      queryClient.setQueryData(sectorKeys.detail(sector.id), sector);
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
      sectorUiActions.closeEditor();
    },
  });
  const submit = form.handleSubmit((values) => {
    form.clearErrors();
    const result = sectorCreatePayloadSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          field === "id" ||
          field === "name" ||
          field === "depth" ||
          field === "parentId"
        )
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
    if (depthLocked && result.data.depth !== initialSector?.depth) {
      form.setError("depth", {
        message: "하위 섹터가 있어 분류를 변경할 수 없습니다.",
      });
      return;
    }
    const parentDepth = sectorParentDepths[result.data.depth];
    if (
      parentDepth !== null &&
      !sectors.some(
        (sector) =>
          sector.id === result.data.parentId && sector.depth === parentDepth,
      )
    ) {
      form.setError("parentId", {
        message: `${sectorDepthLabels[parentDepth]} 섹터를 선택해 주세요.`,
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
        <SectorIdField
          disabled={mutation.isPending}
          form={form}
          mode={editor.mode}
        />
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="sector-name">섹터명</FieldLabel>
          <Input
            {...form.register("name")}
            aria-invalid={Boolean(errors.name)}
            autoFocus={editor.mode === "edit"}
            disabled={mutation.isPending}
            id="sector-name"
            placeholder="반도체"
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <SectorClassificationFields
          depthLocked={depthLocked}
          disabled={mutation.isPending}
          form={form}
          sectorId={editor.mode === "edit" ? editor.id : null}
          sectors={sectors}
        />
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
