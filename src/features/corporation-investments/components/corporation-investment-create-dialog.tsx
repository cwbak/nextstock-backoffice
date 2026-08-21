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
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { equityInvestmentKeys } from "@/data-access/queries/equity-investments/keys";
import { createEquityInvestments } from "@/data-access/queries/equity-investments/mutations";
import type { Corporation } from "@/data-access/schemas/corporation";
import {
  equityInvestmentCreatePayloadSchema,
  type EquityInvestmentCreatePayload,
  type EquityInvestmentCreateResult,
} from "@/data-access/schemas/equity-investment";

interface CorporationInvestmentCreateDialogProps {
  corporations: ReadonlyArray<Corporation>;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: EquityInvestmentCreateResult) => void;
  open: boolean;
}

const createFieldNames = new Set<keyof EquityInvestmentCreatePayload>([
  "corpCode",
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
  const queryClient = useQueryClient();
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<EquityInvestmentCreatePayload>({
    defaultValues: {
      corpCode: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createEquityInvestments,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: equityInvestmentKeys.all,
      });
      onCreated(result);
    },
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
      <FieldGroup>
        <Field data-invalid={Boolean(errors.corpCode)}>
          <FieldLabel htmlFor="investment-corporation-code">
            동기화 법인
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
            등록된 법인 중 최신 출자현황을 동기화할 법인을 선택합니다.
          </FieldDescription>
          <FieldError errors={[errors.corpCode]} />
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
          {mutation.isPending ? "동기화 중" : "동기화"}
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
          <DialogTitle>법인별 출자현황 동기화</DialogTitle>
          <DialogDescription>
            선택한 법인의 최신 출자현황 스냅샷을 DART에서 동기화합니다. 조회할
            보고서는 서버가 현재 시점에 맞춰 결정합니다.
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
