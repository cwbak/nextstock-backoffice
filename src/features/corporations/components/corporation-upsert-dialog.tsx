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
import { upsertCorporation } from "@/data-access/queries/corporations/mutations";
import {
  corporationUpsertPayloadSchema,
  type CorporationUpsertPayload,
} from "@/data-access/schemas/corporation";

interface CorporationUpsertDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

interface CorporationUpsertFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

function CorporationUpsertForm({
  onCancel,
  onSaved,
}: CorporationUpsertFormProps) {
  const queryClient = useQueryClient();
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CorporationUpsertPayload>({
    defaultValues: { code: "" },
  });
  const mutation = useMutation({
    mutationFn: upsertCorporation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: corporationKeys.all });
      onSaved();
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = corporationUpsertPayloadSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "code") {
          setError("code", { message: issue.message });
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
        <Field data-invalid={Boolean(errors.code)}>
          <FieldLabel htmlFor="upsert-corporation-code">
            DART 법인 코드
          </FieldLabel>
          <Input
            aria-invalid={Boolean(errors.code)}
            id="upsert-corporation-code"
            inputMode="numeric"
            maxLength={8}
            placeholder="00126380"
            {...register("code")}
          />
          <FieldDescription>숫자 8자리</FieldDescription>
          <FieldError errors={[errors.code]} />
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

export function CorporationUpsertDialog({
  onOpenChange,
  open,
}: CorporationUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>법인 생성·갱신</DialogTitle>
          <DialogDescription>
            DART 법인 코드를 입력하면 기업개황을 조회해 법인을 생성하거나 최신
            기본정보로 갱신합니다. 기존 부가 정보는 유지됩니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CorporationUpsertForm
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
