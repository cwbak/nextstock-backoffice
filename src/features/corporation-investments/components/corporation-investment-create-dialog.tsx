import { useMutation } from "@tanstack/react-query";
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
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { createEquityInvestments } from "@/data-access/queries/equity-investments/mutations";
import type { Corporation } from "@/data-access/schemas/corporation";
import {
  equityInvestmentCreatePayloadSchema,
  type EquityInvestmentCreatePayload,
  type EquityInvestmentCreateResult,
} from "@/data-access/schemas/equity-investment";
import { CorporationInvestmentPeriodFields } from "@/features/corporation-investments/components/corporation-investment-period-fields";
import { getDefaultCorporationInvestmentPeriod } from "@/features/corporation-investments/corporation-investment-period";

interface CorporationInvestmentCreateDialogProps {
  corporations: ReadonlyArray<Corporation>;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: EquityInvestmentCreateResult) => void;
  open: boolean;
}

const createFieldNames = new Set<keyof EquityInvestmentCreatePayload>([
  "corpCode",
  "bsnsYear",
  "reprtCode",
]);

function isCreateFieldName(
  value: PropertyKey,
): value is keyof EquityInvestmentCreatePayload {
  return createFieldNames.has(value as keyof EquityInvestmentCreatePayload);
}

interface CorporationInvestmentCreateFormProps {
  corporations: ReadonlyArray<Corporation>;
  onCancel: () => void;
  onCreated: (result: EquityInvestmentCreateResult) => void;
}

function CorporationInvestmentCreateForm({
  corporations,
  onCancel,
  onCreated,
}: CorporationInvestmentCreateFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<EquityInvestmentCreatePayload>({
    defaultValues: {
      corpCode: "",
      ...getDefaultCorporationInvestmentPeriod(),
    },
  });
  const mutation = useMutation({
    mutationFn: createEquityInvestments,
    onSuccess: onCreated,
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = equityInvestmentCreatePayloadSchema.safeParse(values);

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
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.corpCode)}
        >
          <FieldLabel htmlFor="investment-corporation-code">
            DRAFT 생성 법인
          </FieldLabel>
          <Controller
            control={control}
            name="corpCode"
            render={({ field }) => (
              <CorporationCombobox
                aria-invalid={Boolean(errors.corpCode)}
                corporations={corporations}
                id="investment-corporation-code"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            등록된 법인 중 DART 지분투자 DRAFT를 생성할 법인을 선택합니다.
          </FieldDescription>
          <FieldError errors={[errors.corpCode]} />
        </Field>
        <Controller
          control={control}
          name="reprtCode"
          render={({ field }) => (
            <CorporationInvestmentPeriodFields
              businessYearError={errors.bsnsYear}
              businessYearRegistration={register("bsnsYear")}
              idPrefix="investment"
              reportCode={field.value}
              reportCodeError={errors.reprtCode}
              onReportCodeChange={field.onChange}
            />
          )}
        />
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
          {mutation.isPending ? "DRAFT 생성 중" : "DRAFT 생성"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CorporationInvestmentCreateDialog({
  corporations,
  onOpenChange,
  onCreated,
  open,
}: CorporationInvestmentCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>법인별 지분투자 DRAFT 생성</DialogTitle>
          <DialogDescription>
            선택한 법인의 정기보고서에서 타법인 출자현황을 조회해 지분투자
            DRAFT로 추가합니다. 기존 지분투자는 갱신하지 않습니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CorporationInvestmentCreateForm
            corporations={corporations}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
