import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Clock3Icon } from "lucide-react";

import { BackgroundJobStatusAlert } from "@/components/common/background-job-status-alert";
import { MutationErrorAlert } from "@/components/common/mutation-error-alert";
import { useBackgroundJob } from "@/components/common/use-background-job";
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
import { equityInvestmentKeys } from "@/data-access/queries/equity-investments/keys";
import { createAllEquityInvestments } from "@/data-access/queries/equity-investments/mutations";
import {
  equityInvestmentBulkCreatePayloadSchema,
  equityInvestmentBulkCreateResultSchema,
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
  const queryClient = useQueryClient();
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
  const jobTracker = useBackgroundJob({
    expectedType: "equity_investments_all",
    resultSchema: equityInvestmentBulkCreateResultSchema,
    onCompleted: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: equityInvestmentKeys.all,
      });
      onCreated(result);
    },
  });
  const mutation = useMutation({
    mutationFn: createAllEquityInvestments,
    onSuccess: jobTracker.track,
  });
  const isBusy = mutation.isPending || jobTracker.isTracking;

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && !isBusy) {
      clearErrors();
      mutation.reset();
      jobTracker.reset();
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

    jobTracker.reset();
    mutation.reset();
    mutation.mutate(result.data);
  });

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl">
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
            Worker가 백그라운드에서 처리합니다. 일부 법인이 실패해도 나머지는
            계속 처리되며 진행 상태를 2초마다 확인합니다.
          </AlertDescription>
        </Alert>
        {jobTracker.jobId !== null && jobTracker.isTracking ? (
          <BackgroundJobStatusAlert
            job={jobTracker.job}
            jobId={jobTracker.jobId}
          />
        ) : null}
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
          {jobTracker.errorMessage || mutation.isError ? (
            <MutationErrorAlert
              message={
                jobTracker.errorMessage ?? getErrorMessage(mutation.error)
              }
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changeOpen(false)}
            >
              {isBusy ? "닫기" : "취소"}
            </Button>
            <Button disabled={isBusy} type="submit">
              {isBusy ? <Spinner data-icon="inline-start" /> : null}
              {isBusy ? "작업 처리 중" : "전체 DRAFT 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
