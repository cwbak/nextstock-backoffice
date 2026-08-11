import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { KrStockCombobox } from "@/components/common/kr-stock-combobox";
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
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krStocksQueryOptions } from "@/data-access/queries/kr-stocks/queries";
import { themeKeys } from "@/data-access/queries/themes/keys";
import { createThemeStock } from "@/data-access/queries/themes/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import {
  themeStockFormSchema,
  type Theme,
  type ThemeStockFormValues,
} from "@/data-access/schemas/theme";

interface ThemeStockCreateDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  theme: Theme;
  themeStocks: ReadonlyArray<KrStock>;
}

interface ThemeStockCreateFormProps {
  availableStocks: ReadonlyArray<KrStock>;
  onCancel: () => void;
  onSaved: () => void;
  theme: Theme;
}

function ThemeStockCreateForm({
  availableStocks,
  onCancel,
  onSaved,
  theme,
}: ThemeStockCreateFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<ThemeStockFormValues>({
    defaultValues: { stockCode: "" },
  });
  const mutation = useMutation({
    mutationFn: createThemeStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: themeKeys.stocks(theme.id),
      });
      onSaved();
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = themeStockFormSchema.safeParse(values);

    if (!result.success) {
      setError("stockCode", {
        message:
          result.error.issues[0]?.message ?? "추가할 기업을 선택해 주세요.",
      });
      return;
    }

    mutation.mutate({ themeId: theme.id, stockCode: result.data.stockCode });
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => void submitForm(event)}
    >
      <Field data-invalid={Boolean(errors.stockCode)}>
        <FieldLabel htmlFor="theme-stock-code">추가할 기업</FieldLabel>
        <Controller
          control={control}
          name="stockCode"
          render={({ field }) => (
            <KrStockCombobox
              aria-invalid={Boolean(errors.stockCode)}
              emptyMessage="추가 가능한 기업이 없습니다."
              id="theme-stock-code"
              placeholder="기업(종목)을 선택하세요"
              stocks={availableStocks}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <FieldDescription>
          등록된 KR 종목 중 이 테마에 연결할 기업을 선택합니다.
        </FieldDescription>
        <FieldError errors={[errors.stockCode]} />
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
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {mutation.isPending ? "추가 중" : "기업 추가"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ThemeStockCreateDialog({
  onOpenChange,
  open,
  theme,
  themeStocks,
}: ThemeStockCreateDialogProps) {
  const krStocksQuery = useQuery({
    ...krStocksQueryOptions,
    enabled: open,
  });
  const themeStockCodes = useMemo(
    () => new Set(themeStocks.map((stock) => stock.code)),
    [themeStocks],
  );
  const availableStocks = useMemo(
    () =>
      krStocksQuery.data?.filter((stock) => !themeStockCodes.has(stock.code)) ??
      [],
    [krStocksQuery.data, themeStockCodes],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{theme.name}에 기업 추가</DialogTitle>
          <DialogDescription>
            선택한 KR 종목을 시스템 테마 #{theme.id}에 연결합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          krStocksQuery.isPending ? (
            <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              등록된 기업을 불러오는 중입니다.
            </div>
          ) : krStocksQuery.isError ? (
            <div className="flex flex-col gap-3">
              <MutationErrorAlert
                message={getErrorMessage(krStocksQuery.error)}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void krStocksQuery.refetch()}
                >
                  다시 시도
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <ThemeStockCreateForm
              availableStocks={availableStocks}
              theme={theme}
              onCancel={() => onOpenChange(false)}
              onSaved={() => onOpenChange(false)}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
