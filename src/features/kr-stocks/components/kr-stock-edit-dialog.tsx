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
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { updateKrStock } from "@/data-access/queries/kr-stocks/mutations";
import type { Corporation } from "@/data-access/schemas/corporation";
import {
  krStockFormSchema,
  type KrStock,
  type KrStockFormValues,
} from "@/data-access/schemas/kr-stock";

interface KrStockEditDialogProps {
  corporations: ReadonlyArray<Corporation>;
  krStock: KrStock | undefined;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const krStockFieldNames = new Set<keyof KrStockFormValues>([
  "code",
  "corporationCode",
  "name",
  "marketType",
  "stockType",
  "listDd",
  "parval",
  "listShrs",
]);

function isKrStockFieldName(
  value: PropertyKey,
): value is keyof KrStockFormValues {
  return krStockFieldNames.has(value as keyof KrStockFormValues);
}

function getDefaultValues(
  krStock: KrStock | undefined,
  corporations: ReadonlyArray<Corporation>,
): KrStockFormValues {
  return {
    code: krStock?.code ?? "",
    corporationCode: krStock?.corporationCode ?? corporations[0]?.code ?? "",
    name: krStock?.name ?? "",
    marketType: krStock?.marketType ?? "KOSPI",
    stockType: krStock?.stockType ?? "",
    listDd: krStock?.listDd ?? "",
    parval: krStock?.parval ?? null,
    listShrs: krStock?.listShrs ?? null,
  };
}

function parseNullableNumber(value: unknown) {
  return value === "" || value === null || typeof value === "undefined"
    ? null
    : Number(value);
}

interface KrStockEditFormProps {
  corporations: ReadonlyArray<Corporation>;
  krStock: KrStock | undefined;
  onCancel: () => void;
  onSaved: () => void;
}

function KrStockEditForm({
  corporations,
  krStock,
  onCancel,
  onSaved,
}: KrStockEditFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrStockFormValues>({
    defaultValues: getDefaultValues(krStock, corporations),
  });
  const mutation = useMutation({
    mutationFn: updateKrStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: krStockKeys.all,
      });
      onSaved();
    },
  });
  const codeRegistration = register("code");

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krStockFormSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName !== "undefined" && isKrStockFieldName(fieldName)) {
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
          <FieldLabel htmlFor="edit-kr-stock-code">종목 코드</FieldLabel>
          <Input
            {...codeRegistration}
            aria-invalid={Boolean(errors.code)}
            id="edit-kr-stock-code"
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
          <FieldLabel htmlFor="edit-kr-stock-name">종목명</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="edit-kr-stock-name"
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
          <FieldDescription>KR 주권 종류 구분</FieldDescription>
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

export function KrStockEditDialog({
  corporations,
  krStock,
  onOpenChange,
  open,
}: KrStockEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>상장 종목 수정</DialogTitle>
          <DialogDescription>
            {krStock?.code ?? ""} 종목 정보와 연결 법인을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <KrStockEditForm
            corporations={corporations}
            krStock={krStock}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
