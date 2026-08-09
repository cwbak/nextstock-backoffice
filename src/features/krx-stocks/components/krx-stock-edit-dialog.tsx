import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { CorporationCombobox } from "@/components/common/corporation-combobox";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krxStockKeys } from "@/data-access/queries/krx-stocks/keys";
import { updateKrxStock } from "@/data-access/queries/krx-stocks/mutations";
import type { Corporation } from "@/data-access/schemas/corporation";
import {
  krxStockFormSchema,
  type KrxStock,
  type KrxStockFormValues,
} from "@/data-access/schemas/krx-stock";

interface KrxStockEditDialogProps {
  corporations: ReadonlyArray<Corporation>;
  krxStock: KrxStock | undefined;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const krxStockFieldNames = new Set<keyof KrxStockFormValues>([
  "code",
  "corporationCode",
  "name",
  "marketType",
  "stockType",
  "listDd",
  "parval",
  "listShrs",
]);

function isKrxStockFieldName(
  value: PropertyKey,
): value is keyof KrxStockFormValues {
  return krxStockFieldNames.has(value as keyof KrxStockFormValues);
}

function getDefaultValues(
  krxStock: KrxStock | undefined,
  corporations: ReadonlyArray<Corporation>,
): KrxStockFormValues {
  return {
    code: krxStock?.code ?? "",
    corporationCode: krxStock?.corporationCode ?? corporations[0]?.code ?? "",
    name: krxStock?.name ?? "",
    marketType: krxStock?.marketType ?? "KOSPI",
    stockType: krxStock?.stockType ?? "",
    listDd: krxStock?.listDd ?? "",
    parval: krxStock?.parval ?? null,
    listShrs: krxStock?.listShrs ?? null,
  };
}

function parseNullableNumber(value: unknown) {
  return value === "" || value === null || typeof value === "undefined"
    ? null
    : Number(value);
}

interface KrxStockEditFormProps {
  corporations: ReadonlyArray<Corporation>;
  krxStock: KrxStock | undefined;
  onCancel: () => void;
  onSaved: () => void;
}

function KrxStockEditForm({
  corporations,
  krxStock,
  onCancel,
  onSaved,
}: KrxStockEditFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrxStockFormValues>({
    defaultValues: getDefaultValues(krxStock, corporations),
  });
  const mutation = useMutation({
    mutationFn: updateKrxStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: krxStockKeys.all,
      });
      onSaved();
    },
  });
  const codeRegistration = register("code");

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krxStockFormSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (
          typeof fieldName !== "undefined" &&
          isKrxStockFieldName(fieldName)
        ) {
          setError(fieldName, { message: issue.message });
        }
      }
      return;
    }

    mutation.mutate(result.data);
  });

  return (
    <form
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      noValidate
      onSubmit={(event) => void submitForm(event)}
    >
      <FieldGroup className="grid min-h-0 max-h-[calc(100svh-13rem)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.code)}>
          <FieldLabel htmlFor="edit-krx-stock-code">종목 코드</FieldLabel>
          <Input
            {...codeRegistration}
            aria-invalid={Boolean(errors.code)}
            id="edit-krx-stock-code"
            maxLength={6}
            placeholder="005930"
            readOnly
            onChange={(event) => {
              event.currentTarget.value =
                event.currentTarget.value.toUpperCase();
              void codeRegistration.onChange(event);
            }}
          />
          <FieldDescription>대문자 또는 숫자 6자리</FieldDescription>
          <FieldError errors={[errors.code]} />
        </Field>
        <Field data-invalid={Boolean(errors.marketType)}>
          <FieldLabel htmlFor="edit-market-type">시장 구분</FieldLabel>
          <Controller
            control={control}
            name="marketType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.marketType)}
                  className="w-full"
                  id="edit-market-type"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="KOSPI">KOSPI</SelectItem>
                    <SelectItem value="KOSDAQ">KOSDAQ</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.marketType]} />
        </Field>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="edit-krx-stock-name">종목명</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="edit-krx-stock-name"
            placeholder="삼성전자"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.stockType)}>
          <FieldLabel htmlFor="edit-stock-type">주식 종류</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.stockType)}
            id="edit-stock-type"
            placeholder="보통주"
            {...register("stockType")}
          />
          <FieldDescription>KRX 주권 종류 구분</FieldDescription>
          <FieldError errors={[errors.stockType]} />
        </Field>
        <Field data-invalid={Boolean(errors.listDd)}>
          <FieldLabel htmlFor="edit-listed-date">상장일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.listDd)}
            id="edit-listed-date"
            type="date"
            {...register("listDd")}
          />
          <FieldError errors={[errors.listDd]} />
        </Field>
        <Field data-invalid={Boolean(errors.parval)}>
          <FieldLabel htmlFor="edit-par-value">액면가</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.parval)}
            id="edit-par-value"
            inputMode="numeric"
            min={0}
            placeholder="5000"
            step={1}
            type="number"
            {...register("parval", { setValueAs: parseNullableNumber })}
          />
          <FieldDescription>미입력 시 값 없음</FieldDescription>
          <FieldError errors={[errors.parval]} />
        </Field>
        <Field data-invalid={Boolean(errors.listShrs)}>
          <FieldLabel htmlFor="edit-listed-shares">상장주식수</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.listShrs)}
            id="edit-listed-shares"
            inputMode="numeric"
            min={0}
            placeholder="5969782550"
            step={1}
            type="number"
            {...register("listShrs", { setValueAs: parseNullableNumber })}
          />
          <FieldDescription>미입력 시 값 없음</FieldDescription>
          <FieldError errors={[errors.listShrs]} />
        </Field>
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.corporationCode)}
        >
          <FieldLabel htmlFor="edit-corporation-code">연결 법인</FieldLabel>
          <Controller
            control={control}
            name="corporationCode"
            render={({ field }) => (
              <CorporationCombobox
                aria-invalid={Boolean(errors.corporationCode)}
                corporations={corporations}
                id="edit-corporation-code"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            먼저 등록된 DART 법인 중 하나를 선택합니다.
          </FieldDescription>
          <FieldError errors={[errors.corporationCode]} />
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

export function KrxStockEditDialog({
  corporations,
  krxStock,
  onOpenChange,
  open,
}: KrxStockEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>상장 종목 수정</DialogTitle>
          <DialogDescription>
            {krxStock?.code ?? ""} 종목 정보와 연결 법인을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrxStockEditForm
            corporations={corporations}
            krxStock={krxStock}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
