import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

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
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { createKrStock } from "@/data-access/queries/kr-stocks/mutations";
import {
  krStockCreatePayloadSchema,
  type KrStockCreatePayload,
} from "@/data-access/schemas/kr-stock";

interface KrStockCreateDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const createFieldNames = new Set<keyof KrStockCreatePayload>([
  "corporationCode",
  "stockCode",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof KrStockCreatePayload {
  return createFieldNames.has(value as keyof KrStockCreatePayload);
}

interface KrStockCreateFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

function KrStockCreateForm({ onCancel, onSaved }: KrStockCreateFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrStockCreatePayload>({
    defaultValues: {
      corporationCode: "",
      stockCode: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createKrStock,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: krStockKeys.all }),
        queryClient.invalidateQueries({ queryKey: corporationKeys.all }),
      ]);
      onSaved();
    },
  });
  const stockCodeRegistration = register("stockCode");

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krStockCreatePayloadSchema.safeParse(values);

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
          {mutation.isPending ? "등록 중" : "등록"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KrStockCreateDialog({
  onOpenChange,
  open,
}: KrStockCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>상장 종목 등록</DialogTitle>
          <DialogDescription>
            DART 법인 코드와 종목 코드를 입력하면 DART·KR 정보를 조회해 법인과
            종목을 함께 등록합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrStockCreateForm
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
