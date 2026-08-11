import type { FormEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";
import { calendarEarningKeys } from "@/data-access/queries/calendar-earnings/keys";
import { createUsCalendarEarnings } from "@/data-access/queries/calendar-earnings/mutations";
import type { CreateUsCalendarEarningsResult } from "@/data-access/schemas/us-calendar-earning";

interface UsCalendarEarningsCreateDialogProps {
  onCreated: (result: CreateUsCalendarEarningsResult) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function UsCalendarEarningsCreateDialog({
  onCreated,
  onOpenChange,
  open,
}: UsCalendarEarningsCreateDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createUsCalendarEarnings,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: calendarEarningKeys.all,
      });
      onCreated(result);
      onOpenChange(false);
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={!mutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>US 실적 일정 추가</DialogTitle>
          <DialogDescription>
            Alpha Vantage에서 앞으로 3개월의 US 실적 캘린더를 가져와 새 일정만
            저장합니다.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Clock3Icon aria-hidden="true" />
          <AlertTitle>외부 데이터를 조회합니다</AlertTitle>
          <AlertDescription>
            등록된 US 종목과 일치하지 않거나 이미 존재하는 일정은 건너뜁니다.
            외부 API 응답에 따라 완료까지 시간이 걸릴 수 있습니다.
          </AlertDescription>
        </Alert>
        <form className="flex flex-col gap-4" onSubmit={submit}>
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
              {mutation.isPending ? "US 일정 추가 중" : "US 일정 추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
