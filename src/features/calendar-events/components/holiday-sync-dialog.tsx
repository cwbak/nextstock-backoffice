import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { CalendarSyncIcon } from "lucide-react";

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
import { syncHolidays } from "@/data-access/queries/calendar-events/mutations";
import {
  holidaySyncPayloadSchema,
  holidaySyncResultSchema,
  type HolidaySyncPayload,
  type HolidaySyncResult,
} from "@/data-access/schemas/holiday";

interface HolidaySyncDialogProps {
  onOpenChange: (open: boolean) => void;
  onSynced: (result: HolidaySyncResult) => void;
  open: boolean;
}

const holidaySyncFieldNames = new Set<keyof HolidaySyncPayload>([
  "fromYear",
  "toYear",
]);

function isHolidaySyncFieldName(
  value: PropertyKey,
): value is keyof HolidaySyncPayload {
  return holidaySyncFieldNames.has(value as keyof HolidaySyncPayload);
}

function getDefaultValues(): HolidaySyncPayload {
  const currentYear = new Date().getFullYear();

  return { fromYear: currentYear, toYear: currentYear };
}

export function HolidaySyncDialog({
  onOpenChange,
  onSynced,
  open,
}: HolidaySyncDialogProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<HolidaySyncPayload>({ defaultValues: getDefaultValues() });
  const jobTracker = useBackgroundJob({
    expectedType: "holidays_sync",
    resultSchema: holidaySyncResultSchema,
    onCompleted: onSynced,
  });
  const mutation = useMutation({
    mutationFn: syncHolidays,
    onSuccess: jobTracker.track,
  });
  const isBusy = mutation.isPending || jobTracker.isTracking;
  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = holidaySyncPayloadSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (
          typeof fieldName !== "undefined" &&
          isHolidaySyncFieldName(fieldName)
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

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && !isBusy) {
      mutation.reset();
      jobTracker.reset();
      reset(getDefaultValues());
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-xl" showCloseButton={!isBusy}>
        <DialogHeader>
          <DialogTitle>공휴일 동기화</DialogTitle>
          <DialogDescription>
            선택한 연도 범위의 공휴일을 공공데이터포털에서 가져와 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <CalendarSyncIcon aria-hidden="true" />
          <AlertTitle>월별로 공휴일을 조회합니다</AlertTitle>
          <AlertDescription>
            시작 연도와 종료 연도를 모두 포함합니다. 외부 API 보호를 위해 월별
            요청 사이에 대기하므로 범위가 길수록 완료까지 시간이 걸립니다.
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
            <Field data-invalid={Boolean(errors.fromYear)}>
              <FieldLabel htmlFor="holiday-sync-from-year">
                시작 연도
              </FieldLabel>
              <Controller
                control={control}
                name="fromYear"
                render={({ field }) => (
                  <Input
                    aria-invalid={Boolean(errors.fromYear)}
                    disabled={isBusy}
                    id="holiday-sync-from-year"
                    inputMode="numeric"
                    max={9999}
                    min={1000}
                    type="number"
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        event.currentTarget.value
                          ? Number(event.currentTarget.value)
                          : 0,
                      )
                    }
                  />
                )}
              />
              <FieldDescription>네 자리 연도</FieldDescription>
              <FieldError errors={[errors.fromYear]} />
            </Field>
            <Field data-invalid={Boolean(errors.toYear)}>
              <FieldLabel htmlFor="holiday-sync-to-year">종료 연도</FieldLabel>
              <Controller
                control={control}
                name="toYear"
                render={({ field }) => (
                  <Input
                    aria-invalid={Boolean(errors.toYear)}
                    disabled={isBusy}
                    id="holiday-sync-to-year"
                    inputMode="numeric"
                    max={9999}
                    min={1000}
                    type="number"
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        event.currentTarget.value
                          ? Number(event.currentTarget.value)
                          : 0,
                      )
                    }
                  />
                )}
              />
              <FieldDescription>시작 연도 이상</FieldDescription>
              <FieldError errors={[errors.toYear]} />
            </Field>
          </FieldGroup>
          {jobTracker.errorMessage || mutation.isError ? (
            <MutationErrorAlert
              message={
                jobTracker.errorMessage ?? getErrorMessage(mutation.error)
              }
              title="공휴일을 동기화하지 못했습니다"
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
              {isBusy ? "공휴일 동기화 중" : "공휴일 동기화"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
