import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { krMarketDataKeys } from "@/data-access/queries/kr-market-data/keys";
import { createAllKrMarketData } from "@/data-access/queries/kr-market-data/mutations";
import {
  krMarketDataCreateAllPayloadSchema,
  type KrMarketDataCreateAllPayload,
  type KrMarketDataCreateResult,
} from "@/data-access/schemas/kr-market-data";

interface KrMarketDataCreateAllDialogProps {
  onCreated: (
    result: KrMarketDataCreateResult,
    payload: KrMarketDataCreateAllPayload,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const fieldNames = new Set<keyof KrMarketDataCreateAllPayload>(["from", "to"]);

function isFieldName(
  value: PropertyKey,
): value is keyof KrMarketDataCreateAllPayload {
  return fieldNames.has(value as keyof KrMarketDataCreateAllPayload);
}

export function KrMarketDataCreateAllDialog({
  onCreated,
  onOpenChange,
  open,
}: KrMarketDataCreateAllDialogProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<KrMarketDataCreateAllPayload>({
    defaultValues: { from: "", to: "" },
  });
  const mutation = useMutation({
    mutationFn: createAllKrMarketData,
    onSuccess: async (result, payload) => {
      await queryClient.invalidateQueries({
        queryKey: krMarketDataKeys.lists(),
      });
      reset({ from: "", to: "" });
      onCreated(result, payload);
    },
  });

  const changeOpen = (nextOpen: boolean) => {
    if (mutation.isPending) {
      return;
    }

    if (!nextOpen) {
      clearErrors();
      mutation.reset();
      reset({ from: "", to: "" });
    }
    onOpenChange(nextOpen);
  };

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krMarketDataCreateAllPayloadSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName !== "undefined" && isFieldName(fieldName)) {
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
          <DialogTitle>KR 전체 종목 일봉 저장</DialogTitle>
          <DialogDescription>
            날짜 구간의 전체 KR 종목 일봉을 ClickHouse에 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>KRX 정보데이터시스템을 날짜별로 조회합니다</AlertTitle>
          <AlertDescription>
            기간이 길면 오래 걸릴 수 있습니다. 휴장일은 건너뛰고, 이미 저장된
            종목과 날짜는 다시 저장하지 않습니다. 처리 중에는 이 창을 닫을 수
            없습니다.
          </AlertDescription>
        </Alert>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => void submitForm(event)}
        >
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.from)}>
              <FieldLabel htmlFor="save-all-market-data-from">
                시작일
              </FieldLabel>
              <Input
                aria-invalid={Boolean(errors.from)}
                id="save-all-market-data-from"
                type="date"
                {...register("from")}
              />
              <FieldError errors={[errors.from]} />
            </Field>
            <Field data-invalid={Boolean(errors.to)}>
              <FieldLabel htmlFor="save-all-market-data-to">종료일</FieldLabel>
              <Input
                aria-invalid={Boolean(errors.to)}
                id="save-all-market-data-to"
                type="date"
                {...register("to")}
              />
              <FieldError errors={[errors.to]} />
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
              onClick={() => changeOpen(false)}
            >
              취소
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
              {mutation.isPending ? "전체 종목 저장 중" : "전체 종목 저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
