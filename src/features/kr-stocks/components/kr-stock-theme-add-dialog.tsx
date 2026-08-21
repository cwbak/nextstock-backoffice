import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { ThemeCombobox } from "@/components/common/theme-combobox";
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
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { themeKeys } from "@/data-access/queries/themes/keys";
import { createThemeStock } from "@/data-access/queries/themes/mutations";
import { themesQueryOptions } from "@/data-access/queries/themes/queries";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import {
  themeStockCreatePayloadSchema,
  type Theme,
} from "@/data-access/schemas/theme";
import { KrStockThemeEmptyState } from "@/features/kr-stocks/components/kr-stock-theme-empty-state";

interface KrStockThemeAddDialogProps {
  krStock: KrStock | null;
  onOpenChange: (open: boolean) => void;
}

interface KrStockThemeFormValues {
  themeId: number | null;
}

interface KrStockThemeAddFormProps {
  krStock: KrStock;
  onCancel: () => void;
  onSaved: () => void;
  themes: ReadonlyArray<Theme>;
}

function KrStockThemeAddForm({
  krStock,
  onCancel,
  onSaved,
  themes,
}: KrStockThemeAddFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<KrStockThemeFormValues>({
    defaultValues: { themeId: null },
  });
  const mutation = useMutation({
    mutationFn: createThemeStock,
    onSuccess: async (_stock, variables) => {
      await queryClient.invalidateQueries({
        queryKey: themeKeys.stocks(variables.themeId),
      });
      onSaved();
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = themeStockCreatePayloadSchema.safeParse({
      stockCode: krStock.code,
      themeId: values.themeId,
    });

    if (!result.success) {
      setError("themeId", { message: "추가할 테마를 선택해 주세요." });
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
      <Field data-invalid={Boolean(errors.themeId)}>
        <FieldLabel htmlFor="kr-stock-theme-id">추가할 테마</FieldLabel>
        <Controller
          control={control}
          name="themeId"
          render={({ field }) => (
            <ThemeCombobox
              aria-invalid={Boolean(errors.themeId)}
              id="kr-stock-theme-id"
              themes={themes}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <FieldDescription>
          연결할 시스템 테마를 ID 또는 이름으로 검색합니다.
        </FieldDescription>
        <FieldError errors={[errors.themeId]} />
      </Field>
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
        <Button
          disabled={mutation.isPending || themes.length === 0}
          type="submit"
        >
          {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {mutation.isPending ? "추가 중" : "테마에 추가"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrStockThemeAddDialog({
  krStock,
  onOpenChange,
}: KrStockThemeAddDialogProps) {
  const open = krStock !== null;
  const themesQuery = useQuery({
    ...themesQueryOptions,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>테마에 기업 추가</DialogTitle>
          <DialogDescription>
            {krStock
              ? `${krStock.name} (${krStock.code}) 기업을 선택한 시스템 테마에 연결합니다.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          themesQuery.isPending ? (
            <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              시스템 테마를 불러오는 중입니다.
            </div>
          ) : themesQuery.isError ? (
            <div className="flex flex-col gap-3">
              <MutationErrorAlert
                message={getErrorMessage(themesQuery.error)}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void themesQuery.refetch()}
                >
                  다시 시도
                </Button>
              </DialogFooter>
            </div>
          ) : themesQuery.data.length === 0 ? (
            <KrStockThemeEmptyState onClose={() => onOpenChange(false)} />
          ) : (
            <KrStockThemeAddForm
              krStock={krStock}
              themes={themesQuery.data}
              onCancel={() => onOpenChange(false)}
              onSaved={() => onOpenChange(false)}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
