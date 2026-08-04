import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Clock3Icon } from "lucide-react";

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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { createAllEquityInvestments } from "@/data-access/queries/equity-investments/mutations";
import {
  equityInvestmentBulkCreatePayloadSchema,
  type EquityInvestmentBulkCreatePayload,
  type EquityInvestmentBulkCreateResult,
} from "@/data-access/schemas/equity-investment";
import { CorporationInvestmentPeriodFields } from "@/features/corporation-investments/components/corporation-investment-period-fields";
import { getDefaultCorporationInvestmentPeriod } from "@/features/corporation-investments/corporation-investment-period";

interface CorporationInvestmentsBulkCreateDialogProps {
  corporationCount: number;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: EquityInvestmentBulkCreateResult) => void;
  open: boolean;
}

const bulkCreateFieldNames = new Set<keyof EquityInvestmentBulkCreatePayload>([
  "bsnsYear",
  "reprtCode",
]);

function isBulkCreateFieldName(
  value: PropertyKey,
): value is keyof EquityInvestmentBulkCreatePayload {
  return bulkCreateFieldNames.has(
    value as keyof EquityInvestmentBulkCreatePayload,
  );
}

export function CorporationInvestmentsBulkCreateDialog({
  corporationCount,
  onOpenChange,
  onCreated,
  open,
}: CorporationInvestmentsBulkCreateDialogProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<EquityInvestmentBulkCreatePayload>({
    defaultValues: getDefaultCorporationInvestmentPeriod(),
  });
  const mutation = useMutation({
    mutationFn: createAllEquityInvestments,
    onSuccess: onCreated,
  });

  const changeOpen = (nextOpen: boolean) => {
    if (mutation.isPending) {
      return;
    }

    if (!nextOpen) {
      clearErrors();
      mutation.reset();
      reset(getDefaultCorporationInvestmentPeriod());
    }
    onOpenChange(nextOpen);
  };

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = equityInvestmentBulkCreatePayloadSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (
          typeof fieldName !== "undefined" &&
          isBulkCreateFieldName(fieldName)
        ) {
          setError(fieldName, { message: issue.message });
        }
      }
      return;
    }

    mutation.mutate(result.data);
  });

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={!mutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>전체 법인 지분투자 DRAFT 생성</DialogTitle>
          <DialogDescription>
            등록된 모든 법인의 정기보고서를 순차 조회해 지분투자를 DRAFT로
            추가합니다. 기존 지분투자는 갱신하지 않습니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>
            {corporationCount.toLocaleString("ko-KR")}개 법인을 순차 처리합니다
          </AlertTitle>
          <AlertDescription>
            완료까지 오래 걸릴 수 있습니다. 처리 중에는 이 창을 닫을 수 없으며,
            일부 법인이 실패해도 나머지는 계속 처리됩니다.
          </AlertDescription>
        </Alert>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => void submitForm(event)}
        >
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="reprtCode"
              render={({ field }) => (
                <CorporationInvestmentPeriodFields
                  businessYearError={errors.bsnsYear}
                  businessYearRegistration={register("bsnsYear")}
                  idPrefix="bulk-investment"
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
              onClick={() => changeOpen(false)}
            >
              취소
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
              {mutation.isPending ? "전체 법인 처리 중" : "전체 DRAFT 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
