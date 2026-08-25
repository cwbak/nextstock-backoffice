import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { TriangleAlertIcon } from "lucide-react";

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import { adjustKrMarketData } from "@/data-access/queries/kr-market-data/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import {
  krMarketDataAdjustPayloadSchema,
  type KrMarketDataAdjustPayload,
  type KrMarketDataAdjustResult,
} from "@/data-access/schemas/kr-market-data";

interface KrMarketDataAdjustDialogProps {
  initialStockCode: string | undefined;
  onAdjusted: (
    result: KrMarketDataAdjustResult,
    payload: KrMarketDataAdjustPayload,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  stocks: ReadonlyArray<KrStock>;
}

interface KrMarketDataAdjustFormProps extends Omit<
  KrMarketDataAdjustDialogProps,
  "open" | "onOpenChange"
> {
  onCancel: () => void;
}

function KrMarketDataAdjustForm({
  initialStockCode,
  onAdjusted,
  onCancel,
  stocks,
}: KrMarketDataAdjustFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<KrMarketDataAdjustPayload>({
    defaultValues: { stockCode: initialStockCode ?? "" },
  });
  const mutation = useMutation({
    mutationFn: adjustKrMarketData,
    onSuccess: async (result, payload) => {
      await queryClient.invalidateQueries({
        queryKey: krMarketDataKeys.stock(payload.stockCode),
      });
      onAdjusted(result, payload);
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krMarketDataAdjustPayloadSchema.safeParse(values);

    if (!result.success) {
      const issue = result.error.issues.find(
        ({ path }) => path[0] === "stockCode",
      );

      if (issue) {
        setError("stockCode", { message: issue.message });
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
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle>원본주가의 전일대비를 먼저 확인하세요</AlertTitle>
        <AlertDescription>
          전일대비가 누락되어 0으로 저장된 원본 데이터는 일반 가격 변동을
          액면분할·병합으로 오인할 수 있습니다. 선택한 종목 전체 수정주가가 다시
          계산될 수 있습니다.
        </AlertDescription>
      </Alert>
      <Field data-invalid={Boolean(errors.stockCode)}>
        <FieldLabel htmlFor="adjust-market-data-stock-code">KR 종목</FieldLabel>
        <Controller
          control={control}
          name="stockCode"
          render={({ field }) => (
            <KrStockCombobox
              aria-invalid={Boolean(errors.stockCode)}
              id="adjust-market-data-stock-code"
              stocks={stocks}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <FieldError errors={[errors.stockCode]} />
      </Field>
      {mutation.isError ? (
        <MutationErrorAlert
          message={getErrorMessage(mutation.error)}
          title="수정주가를 반영하지 못했습니다"
        />
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
          {mutation.isPending ? "수정주가 반영 중" : "수정주가 반영"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrMarketDataAdjustDialog({
  initialStockCode,
  onAdjusted,
  onOpenChange,
  open,
  stocks,
}: KrMarketDataAdjustDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>KR 수정주가 반영</DialogTitle>
          <DialogDescription>
            원본주가를 기준으로 수정주가를 증분 반영하고, 조정 경계가 발견되면
            해당 종목의 수정주가 이력을 다시 계산합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrMarketDataAdjustForm
            initialStockCode={initialStockCode}
            stocks={stocks}
            onAdjusted={onAdjusted}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
