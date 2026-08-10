import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { themeKeys } from "@/data-access/queries/themes/keys";
import { createTheme } from "@/data-access/queries/themes/mutations";
import {
  themeCreatePayloadSchema,
  type Theme,
  type ThemeCreatePayload,
} from "@/data-access/schemas/theme";

interface ThemeCreateDialogProps {
  onCreated: (theme: Theme) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  themes: ReadonlyArray<Theme>;
}

const createFieldNames = new Set<keyof ThemeCreatePayload>([
  "id",
  "parentThemeId",
  "name",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof ThemeCreatePayload {
  return createFieldNames.has(value as keyof ThemeCreatePayload);
}

interface ThemeCreateFormProps {
  onCancel: () => void;
  onCreated: (theme: Theme) => void;
  themes: ReadonlyArray<Theme>;
}

function ThemeCreateForm({
  onCancel,
  onCreated,
  themes,
}: ThemeCreateFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ThemeCreatePayload>({
    defaultValues: {
      id: 0,
      parentThemeId: null,
      name: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createTheme,
    onSuccess: async (theme) => {
      await queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      onCreated(theme);
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = themeCreatePayloadSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName !== "undefined" && isCreateFieldName(fieldName)) {
          setError(fieldName, { message: issue.message });
        }
      }
      return;
    }

    mutation.mutate(result.data);
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => void submitForm(event)}
    >
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.id)}>
          <FieldLabel htmlFor="create-theme-id">네이버 테마 ID</FieldLabel>
          <Controller
            control={control}
            name="id"
            render={({ field }) => (
              <Input
                aria-invalid={Boolean(errors.id)}
                id="create-theme-id"
                inputMode="numeric"
                min={1}
                placeholder="500"
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
          <FieldDescription>네이버에서 사용하는 양의 정수 ID</FieldDescription>
          <FieldError errors={[errors.id]} />
        </Field>
        <Field data-invalid={Boolean(errors.parentThemeId)}>
          <FieldLabel htmlFor="create-parent-theme-id">상위 테마 ID</FieldLabel>
          <Controller
            control={control}
            name="parentThemeId"
            render={({ field }) => (
              <Input
                aria-invalid={Boolean(errors.parentThemeId)}
                id="create-parent-theme-id"
                inputMode="numeric"
                list="parent-theme-options"
                min={1}
                placeholder="최상위 테마는 비워 두세요"
                type="number"
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.currentTarget.value
                      ? Number(event.currentTarget.value)
                      : null,
                  )
                }
              />
            )}
          />
          <datalist id="parent-theme-options">
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </datalist>
          <FieldDescription>하위 테마를 만들 때만 입력합니다.</FieldDescription>
          <FieldError errors={[errors.parentThemeId]} />
        </Field>
        <Field className="sm:col-span-2" data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="create-theme-name">테마명</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="create-theme-name"
            placeholder="신규 테마"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>
      {mutation.isError ? (
        <MutationErrorAlert message={getErrorMessage(mutation.error)} />
      ) : null}
      <DialogFooter>
        <Button
          disabled={mutation.isPending}
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {mutation.isPending ? "추가 중" : "추가"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ThemeCreateDialog({
  onCreated,
  onOpenChange,
  open,
  themes,
}: ThemeCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>테마 추가</DialogTitle>
          <DialogDescription>
            네이버 테마 ID와 이름으로 시스템 테마를 생성합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ThemeCreateForm
            themes={themes}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
