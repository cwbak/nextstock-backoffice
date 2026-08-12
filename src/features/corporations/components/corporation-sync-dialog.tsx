import { useMutation } from "@tanstack/react-query";
import { CloudDownloadIcon } from "lucide-react";

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
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { syncCorporations } from "@/data-access/queries/corporations/mutations";
import type { CorporationSyncResult } from "@/data-access/schemas/corporation";

interface CorporationSyncDialogProps {
  onOpenChange: (open: boolean) => void;
  onSynced: (result: CorporationSyncResult) => void;
  open: boolean;
}

export function CorporationSyncDialog({
  onOpenChange,
  onSynced,
  open,
}: CorporationSyncDialogProps) {
  const mutation = useMutation({
    mutationFn: syncCorporations,
    onSuccess: (result) => {
      onSynced(result);
    },
  });

  const changeOpen = (nextOpen: boolean) => {
    if (mutation.isPending) {
      return;
    }

    if (!nextOpen) {
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>DART 법인명 동기화</DialogTitle>
          <DialogDescription>
            DART 고유번호 파일로 법인명 원장을 동기화합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <CloudDownloadIcon aria-hidden="true" />
          <AlertTitle>새 법인명을 법인명 원장에 추가합니다</AlertTitle>
          <AlertDescription>
            법인 코드와 정규화된 이름 조합이 없으면 법인명 원장에 추가합니다.
            등록된 법인 기본정보는 변경하지 않습니다.
          </AlertDescription>
        </Alert>
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
          <Button
            disabled={mutation.isPending}
            type="button"
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            {mutation.isPending ? "동기화 중" : "동기화"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
