import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { syncKrStocks } from "@/data-access/queries/kr-stocks/mutations";
import type { KrStockSyncResult } from "@/data-access/schemas/kr-stock";

interface KrStockSyncDialogProps {
  onOpenChange: (open: boolean) => void;
  onSynced: (result: KrStockSyncResult) => void;
  open: boolean;
}

export function KrStockSyncDialog({
  onOpenChange,
  onSynced,
  open,
}: KrStockSyncDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: syncKrStocks,
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: krStockKeys.all });
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: corporationKeys.all }),
        queryClient.invalidateQueries({ queryKey: krStockKeys.all }),
      ]);
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
          <DialogTitle>KR 종목·법인명 동기화</DialogTitle>
          <DialogDescription>
            KRX 종목 기본정보를 갱신한 뒤 DART 고유번호로 법인명을 동기화합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <CloudDownloadIcon aria-hidden="true" />
          <AlertTitle>종목 정보와 DART 법인명을 함께 동기화합니다</AlertTitle>
          <AlertDescription>
            <p>
              KRX KOSPI·KOSDAQ 기본정보로 DB에 등록된 종목명·액면가·
              상장주식수를 갱신합니다. KRX에만 존재하는 종목은 추가하지
              않습니다.
            </p>
            <p>
              이어서 DART 고유번호의 새 법인명을 추가하고, 이름이 변경된 등록
              법인은 기업개황으로 갱신합니다. DART 단계가 실패해도 먼저 완료된
              KRX 종목 갱신은 유지됩니다.
            </p>
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
