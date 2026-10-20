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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { upsertCorporations } from "@/data-access/queries/corporations/mutations";
import {
  corporationUpsertFormSchema,
  type CorporationUpsertFormValues,
} from "@/data-access/schemas/corporation";
import { CorporationCodesField } from "@/features/corporations/components/corporation-codes-field";

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
  } = useForm<CorporationUpsertFormValues>({
    defaultValues: { codes: "" },
  });
  const mutation = useMutation({
    mutationFn: upsertCorporations,
    onSettled: async (_data, error) => {
      await queryClient.invalidateQueries({ queryKey: corporationKeys.all });
      if (!error) {
        onSaved();
      }
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = corporationUpsertFormSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "codes") {
          setError("codes", { message: issue.message });
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
        <CorporationCodesField
          disabled={mutation.isPending}
          errorMessage={errors.codes?.message}
          registration={register("codes")}
        />
      </FieldGroup>
      {mutation.isError ? (
        <MutationErrorAlert
          message={`${getErrorMessage(mutation.error)} 오류 전에 처리된 법인은 저장되었을 수 있습니다. 목록을 확인해 주세요.`}
          title="법인 생성·갱신을 완료하지 못했습니다"
        />
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
            DART 법인 코드를 여러 개 입력하면 각 기업개황을 조회해 법인을
            생성하거나 최신 기본정보로 갱신합니다. 기존 부가 정보는 유지됩니다.
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
