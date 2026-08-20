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
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { upsertKrStock } from "@/data-access/queries/kr-stocks/mutations";
import {
  krStockUpsertPayloadSchema,
  type KrStockUpsertPayload,
} from "@/data-access/schemas/kr-stock";
import { KrStockCorporationClassSelect } from "@/features/kr-stocks/components/kr-stock-corporation-class-select";

interface KrStockUpsertDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const upsertFieldNames = new Set<keyof KrStockUpsertPayload>([
  "corporationClass",
  "corporationCode",
  "stockCode",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof KrStockUpsertPayload {
  return upsertFieldNames.has(value as keyof KrStockUpsertPayload);
}

interface KrStockUpsertFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

function KrStockUpsertForm({ onCancel, onSaved }: KrStockUpsertFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrStockUpsertPayload>({
    defaultValues: {
      corporationCode: "",
      stockCode: "",
    },
  });
  const mutation = useMutation({
    mutationFn: upsertKrStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: krStockKeys.all });
      onSaved();
    },
  });
  const stockCodeRegistration = register("stockCode");

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krStockUpsertPayloadSchema.safeParse(values);

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
        <Field data-invalid={Boolean(errors.corporationCode)}>
          <FieldLabel htmlFor="create-corporation-code">
            DART 법인 코드
          </FieldLabel>
          <Input
            aria-invalid={Boolean(errors.corporationCode)}
            id="create-corporation-code"
            inputMode="numeric"
            maxLength={8}
            placeholder="00126380"
            {...register("corporationCode")}
          />
          <FieldDescription>숫자 8자리</FieldDescription>
          <FieldError errors={[errors.corporationCode]} />
        </Field>
        <Field data-invalid={Boolean(errors.stockCode)}>
          <FieldLabel htmlFor="create-kr-stock-code">종목 코드</FieldLabel>
          <Input
            {...stockCodeRegistration}
            aria-invalid={Boolean(errors.stockCode)}
            id="create-kr-stock-code"
            maxLength={6}
            placeholder="005930"
            onChange={(event) => {
              event.currentTarget.value =
                event.currentTarget.value.toUpperCase();
              void stockCodeRegistration.onChange(event);
            }}
          />
          <FieldDescription>대문자 또는 숫자 6자리</FieldDescription>
          <FieldError errors={[errors.stockCode]} />
        </Field>
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.corporationClass)}
        >
          <FieldLabel htmlFor="create-kr-stock-corporation-class">
            대체 상장 시장 (선택)
          </FieldLabel>
          <Controller
            control={control}
            name="corporationClass"
            render={({ field }) => (
              <KrStockCorporationClassSelect
                aria-invalid={Boolean(errors.corporationClass)}
                id="create-kr-stock-corporation-class"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            DART 시장 구분이 Y/K가 아닐 때만 사용합니다.
          </FieldDescription>
          <FieldError errors={[errors.corporationClass]} />
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
          {mutation.isPending ? "저장 중" : "저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrStockUpsertDialog({
  onOpenChange,
  open,
}: KrStockUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>상장 종목 생성·갱신</DialogTitle>
          <DialogDescription>
            등록된 DART 법인 코드와 종목 코드를 입력하면 DART·한국투자증권 최신
            정보로 종목을 생성하거나 갱신합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrStockUpsertForm
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
