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
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/data-access/api/client";
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { updateCorporation } from "@/data-access/queries/corporations/mutations";
import {
  corporationFormSchema,
  type Corporation,
  type CorporationFormValues,
} from "@/data-access/schemas/corporation";

interface CorporationEditDialogProps {
  corporation: Corporation | undefined;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const corporationFieldNames = new Set<keyof CorporationFormValues>([
  "code",
  "name",
  "nameEn",
  "ceoNm",
  "hmUrl",
  "address",
  "estDt",
  "accMt",
  "indutyCode",
  "summary",
  "products",
]);

function isCorporationFieldName(
  value: PropertyKey,
): value is keyof CorporationFormValues {
  return corporationFieldNames.has(value as keyof CorporationFormValues);
}

function getDefaultValues(corporation?: Corporation): CorporationFormValues {
  return {
    code: corporation?.code ?? "",
    name: corporation?.name ?? "",
    nameEn: corporation?.nameEn ?? "",
    ceoNm: corporation?.ceoNm ?? "",
    hmUrl: corporation?.hmUrl ?? "",
    address: corporation?.address ?? "",
    estDt: corporation?.estDt ?? "",
    accMt: corporation?.accMt ?? 12,
    indutyCode: corporation?.indutyCode ?? "",
    summary: corporation?.info?.summary.join("\n") ?? "",
    products: corporation?.info?.product.join("\n") ?? "",
  };
}

interface CorporationFormProps {
  corporation: Corporation | undefined;
  onCancel: () => void;
  onSaved: () => void;
}

function CorporationForm({
  corporation,
  onCancel,
  onSaved,
}: CorporationFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CorporationFormValues>({
    defaultValues: getDefaultValues(corporation),
  });
  const mutation = useMutation({
    mutationFn: updateCorporation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: corporationKeys.all,
      });
      onSaved();
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: corporationKeys.all,
      });
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = corporationFormSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (
          typeof fieldName !== "undefined" &&
          isCorporationFieldName(fieldName)
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
          <FieldLabel htmlFor="edit-corporation-code">
            DART 법인 코드
          </FieldLabel>
          <Input
            aria-invalid={Boolean(errors.code)}
            id="edit-corporation-code"
            inputMode="numeric"
            maxLength={8}
            placeholder="00126380"
            readOnly
            {...register("code")}
          />
          <FieldError errors={[errors.code]} />
        </Field>
        <Field data-invalid={Boolean(errors.indutyCode)}>
          <FieldLabel htmlFor="edit-industry-code">업종 코드</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.indutyCode)}
            id="edit-industry-code"
            inputMode="numeric"
            placeholder="264"
            {...register("indutyCode")}
          />
          <FieldError errors={[errors.indutyCode]} />
        </Field>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="edit-corporation-name">법인명</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="edit-corporation-name"
            placeholder="삼성전자"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.nameEn)}>
          <FieldLabel htmlFor="edit-corporation-name-en">
            영문 법인명
          </FieldLabel>
          <Input
            aria-invalid={Boolean(errors.nameEn)}
            id="edit-corporation-name-en"
            placeholder="Samsung Electronics"
            {...register("nameEn")}
          />
          <FieldError errors={[errors.nameEn]} />
        </Field>
        <Field data-invalid={Boolean(errors.ceoNm)}>
          <FieldLabel htmlFor="edit-corporation-ceo">대표자명</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.ceoNm)}
            id="edit-corporation-ceo"
            placeholder="한종희"
            {...register("ceoNm")}
          />
          <FieldError errors={[errors.ceoNm]} />
        </Field>
        <Field data-invalid={Boolean(errors.hmUrl)}>
          <FieldLabel htmlFor="edit-corporation-homepage">홈페이지</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.hmUrl)}
            id="edit-corporation-homepage"
            placeholder="https://www.samsung.com/sec"
            type="url"
            {...register("hmUrl")}
          />
          <FieldError errors={[errors.hmUrl]} />
        </Field>
        <Field className="sm:col-span-2" data-invalid={Boolean(errors.address)}>
          <FieldLabel htmlFor="edit-corporation-address">주소</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.address)}
            id="edit-corporation-address"
            placeholder="경기도 수원시 영통구 삼성로 129"
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
        <Field data-invalid={Boolean(errors.estDt)}>
          <FieldLabel htmlFor="edit-established-date">설립일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.estDt)}
            id="edit-established-date"
            type="date"
            {...register("estDt")}
          />
          <FieldError errors={[errors.estDt]} />
        </Field>
        <Field data-invalid={Boolean(errors.accMt)}>
          <FieldLabel htmlFor="edit-accounting-month">결산월</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.accMt)}
            id="edit-accounting-month"
            max={12}
            min={1}
            type="number"
            {...register("accMt", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.accMt]} />
        </Field>
        <Field className="sm:col-span-2" data-invalid={Boolean(errors.summary)}>
          <FieldLabel htmlFor="edit-corporation-summary">법인 요약</FieldLabel>
          <Textarea
            aria-invalid={Boolean(errors.summary)}
            id="edit-corporation-summary"
            placeholder={"전자제품 제조\n글로벌 반도체 기업"}
            rows={3}
            {...register("summary")}
          />
          <FieldDescription>
            요약 항목을 한 줄에 하나씩 입력합니다.
          </FieldDescription>
          <FieldError errors={[errors.summary]} />
        </Field>
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.products)}
        >
          <FieldLabel htmlFor="edit-corporation-products">주요 제품</FieldLabel>
          <Textarea
            aria-invalid={Boolean(errors.products)}
            id="edit-corporation-products"
            placeholder={"반도체\n스마트폰\n가전"}
            rows={3}
            {...register("products")}
          />
          <FieldDescription>제품을 한 줄에 하나씩 입력합니다.</FieldDescription>
          <FieldError errors={[errors.products]} />
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

export function CorporationEditDialog({
  corporation,
  onOpenChange,
  open,
}: CorporationEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>법인 수정</DialogTitle>
          <DialogDescription>
            {corporation?.code ?? ""} 법인의 기본 정보와 설명을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CorporationForm
            corporation={corporation}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
