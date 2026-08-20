import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export function KrStockEditFormLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="기존 종목명 별칭 불러오는 중"
      className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground"
      role="status"
    >
      <Spinner />
      기존 종목명 별칭을 불러오는 중입니다.
    </div>
  );
}

interface KrStockEditFormLoadErrorProps {
  isRetrying: boolean;
  message: string;
  onCancel: () => void;
  onRetry: () => void;
}

export function KrStockEditFormLoadError({
  isRetrying,
  message,
  onCancel,
  onRetry,
}: KrStockEditFormLoadErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>종목명 별칭을 불러오지 못했습니다</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button disabled={isRetrying} type="button" onClick={onRetry}>
          {isRetrying ? <Spinner data-icon="inline-start" /> : null}
          {isRetrying ? "다시 불러오는 중" : "다시 시도"}
        </Button>
      </DialogFooter>
    </div>
  );
}
