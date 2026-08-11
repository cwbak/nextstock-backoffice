import { useId, useState, type FormEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { usStockKeys } from "@/data-access/queries/us-stocks/keys";
import { uploadUsStockCsv } from "@/data-access/queries/us-stocks/mutations";
import type { UsStockUploadResult } from "@/data-access/schemas/us-stock";

const maxCsvFileSize = 4 * 1024 * 1024;

interface UsStockUploadDialogProps {
  onOpenChange: (open: boolean) => void;
  onUploaded: (result: UsStockUploadResult) => void;
  open: boolean;
}

export function UsStockUploadDialog({
  onOpenChange,
  onUploaded,
  open,
}: UsStockUploadDialogProps) {
  const inputId = useId();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: uploadUsStockCsv,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: usStockKeys.all });
      setFile(null);
      setFileError(null);
      onUploaded(result);
      onOpenChange(false);
    },
  });

  const changeOpen = (nextOpen: boolean) => {
    if (mutation.isPending) {
      return;
    }

    if (!nextOpen) {
      setFile(null);
      setFileError(null);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFileError(null);

    if (file === null) {
      setFileError("업로드할 CSV 파일을 선택해 주세요.");
      return;
    }
    if (file.size > maxCsvFileSize) {
      setFileError("CSV 파일은 4 MiB 이하여야 합니다.");
      return;
    }

    mutation.mutate(file);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={!mutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>US 종목 정보 CSV 업로드</DialogTitle>
          <DialogDescription>
            Us Stock Screener에서 내려받은 CSV를 Symbol 기준으로 추가하거나
            변경합니다. 전체 파일을 검증한 뒤 한 번에 반영합니다.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={submit}>
          <FieldGroup>
            <Field data-invalid={fileError !== null}>
              <FieldLabel htmlFor={inputId}>CSV 파일</FieldLabel>
              <Input
                accept=".csv,text/csv"
                aria-invalid={fileError !== null}
                disabled={mutation.isPending}
                id={inputId}
                type="file"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setFileError(null);
                }}
              />
              <FieldDescription>CSV 형식 · 최대 4 MiB</FieldDescription>
              <FieldError>{fileError}</FieldError>
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
              {mutation.isPending ? "CSV 반영 중" : "CSV 업로드"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
