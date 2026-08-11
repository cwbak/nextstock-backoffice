import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { CloudDownloadIcon } from "lucide-react";

import { KrStockCombobox } from "@/components/common/kr-stock-combobox";
import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import { createKrMarketData } from "@/data-access/queries/kr-market-data/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import {
  krMarketDataCreatePayloadSchema,
  type KrMarketDataCreatePayload,
  type KrMarketDataCreateResult,
} from "@/data-access/schemas/kr-market-data";

interface KrMarketDataSaveDialogProps {
  initialStockCode: string | undefined;
  onCreated: (
    result: KrMarketDataCreateResult,
    payload: KrMarketDataCreatePayload,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  stocks: ReadonlyArray<KrStock>;
}

const createFieldNames = new Set<keyof KrMarketDataCreatePayload>([
  "stockCode",
  "from",
  "to",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof KrMarketDataCreatePayload {
  return createFieldNames.has(value as keyof KrMarketDataCreatePayload);
}

interface KrMarketDataSaveFormProps extends Omit<
  KrMarketDataSaveDialogProps,
  "open" | "onOpenChange"
> {
  onCancel: () => void;
}

function KrMarketDataSaveForm({
  initialStockCode,
  onCancel,
  onCreated,
  stocks,
}: KrMarketDataSaveFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrMarketDataCreatePayload>({
    defaultValues: {
      stockCode: initialStockCode ?? "",
      from: "",
      to: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createKrMarketData,
    onSuccess: async (result, payload) => {
      await queryClient.invalidateQueries({
        queryKey: krMarketDataKeys.stock(payload.stockCode),
      });
      onCreated(result, payload);
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krMarketDataCreatePayloadSchema.safeParse(values);

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
      <Alert>
        <CloudDownloadIcon aria-hidden="true" />
        <AlertTitle>한국투자증권에서 일봉을 조회합니다</AlertTitle>
        <AlertDescription>
          같은 종목과 날짜의 기존 일봉은 다시 저장하지 않습니다. 기간이 길면
          외부 API 조회에 시간이 걸릴 수 있습니다.
        </AlertDescription>
      </Alert>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.stockCode)}
        >
          <FieldLabel htmlFor="save-market-data-stock-code">KR 종목</FieldLabel>
          <Controller
            control={control}
            name="stockCode"
            render={({ field }) => (
              <KrStockCombobox
                aria-invalid={Boolean(errors.stockCode)}
                id="save-market-data-stock-code"
                stocks={stocks}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.stockCode]} />
        </Field>
        <Field data-invalid={Boolean(errors.from)}>
          <FieldLabel htmlFor="save-market-data-from">시작일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.from)}
            id="save-market-data-from"
            type="date"
            {...register("from")}
          />
          <FieldError errors={[errors.from]} />
        </Field>
        <Field data-invalid={Boolean(errors.to)}>
          <FieldLabel htmlFor="save-market-data-to">종료일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.to)}
            id="save-market-data-to"
            type="date"
            {...register("to")}
          />
          <FieldError errors={[errors.to]} />
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
          {mutation.isPending ? "일봉 저장 중" : "일봉 저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrMarketDataSaveDialog({
  initialStockCode,
  onCreated,
  onOpenChange,
  open,
  stocks,
}: KrMarketDataSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KR 일봉 저장</DialogTitle>
          <DialogDescription>
            종목과 기간을 선택해 보정주가 일봉을 ClickHouse에 저장합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrMarketDataSaveForm
            initialStockCode={initialStockCode}
            stocks={stocks}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
