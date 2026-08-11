import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { CloudDownloadIcon } from "lucide-react";

import { KrxStockCombobox } from "@/components/common/krx-stock-combobox";
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
import { krxMarketDataKeys } from "@/data-access/queries/krx-market-data/keys";
import { createKrxMarketData } from "@/data-access/queries/krx-market-data/mutations";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import {
  krxMarketDataCreatePayloadSchema,
  type KrxMarketDataCreatePayload,
  type KrxMarketDataCreateResult,
  type KrxMarketDataListParams,
} from "@/data-access/schemas/krx-market-data";
import { KrxMarketDataPeriodSelect } from "@/features/krx-market-data/components/krx-market-data-period-select";

interface KrxMarketDataSaveDialogProps {
  initialParams: KrxMarketDataListParams | null;
  onCreated: (
    result: KrxMarketDataCreateResult,
    payload: KrxMarketDataCreatePayload,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  stocks: ReadonlyArray<KrxStock>;
}

const createFieldNames = new Set<keyof KrxMarketDataCreatePayload>([
  "stockCode",
  "period",
  "from",
  "to",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof KrxMarketDataCreatePayload {
  return createFieldNames.has(value as keyof KrxMarketDataCreatePayload);
}

interface KrxMarketDataSaveFormProps extends Omit<
  KrxMarketDataSaveDialogProps,
  "open" | "onOpenChange"
> {
  onCancel: () => void;
}

function KrxMarketDataSaveForm({
  initialParams,
  onCancel,
  onCreated,
  stocks,
}: KrxMarketDataSaveFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrxMarketDataCreatePayload>({
    defaultValues: {
      stockCode: initialParams?.stockCode ?? "",
      period: initialParams?.period ?? "daily",
      from: initialParams?.from ?? "",
      to: initialParams?.to ?? "",
    },
  });
  const mutation = useMutation({
    mutationFn: createKrxMarketData,
    onSuccess: async (result, payload) => {
      await queryClient.invalidateQueries({
        queryKey: krxMarketDataKeys.stock(payload.stockCode),
      });
      onCreated(result, payload);
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krxMarketDataCreatePayloadSchema.safeParse(values);

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
        <AlertTitle>한국투자증권에서 캔들을 조회합니다</AlertTitle>
        <AlertDescription>
          같은 종목·주기·날짜의 기존 데이터는 다시 저장하지 않습니다. 기간이
          길면 외부 API 조회에 시간이 걸릴 수 있습니다.
        </AlertDescription>
      </Alert>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          className="sm:col-span-3"
          data-invalid={Boolean(errors.stockCode)}
        >
          <FieldLabel htmlFor="save-market-data-stock-code">
            KRX 종목
          </FieldLabel>
          <Controller
            control={control}
            name="stockCode"
            render={({ field }) => (
              <KrxStockCombobox
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
        <Field data-invalid={Boolean(errors.period)}>
          <FieldLabel htmlFor="save-market-data-period">캔들 주기</FieldLabel>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <KrxMarketDataPeriodSelect
                aria-invalid={Boolean(errors.period)}
                id="save-market-data-period"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.period]} />
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
          {mutation.isPending ? "캔들 저장 중" : "캔들 저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrxMarketDataSaveDialog({
  initialParams,
  onCreated,
  onOpenChange,
  open,
  stocks,
}: KrxMarketDataSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KRX 캔들 저장</DialogTitle>
          <DialogDescription>
            종목, 주기, 기간을 선택해 보정주가 캔들을 ClickHouse에 저장합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrxMarketDataSaveForm
            initialParams={initialParams}
            stocks={stocks}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
