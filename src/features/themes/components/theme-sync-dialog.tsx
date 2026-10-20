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
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/data-access/api/client";
import { isThemeSyncBlocked } from "@/data-access/queries/themes/sync-plan";
import {
  ThemeSyncIssues,
  ThemeSyncProgressAlert,
  ThemeSyncResultSummary,
  ThemeSyncReview,
} from "@/features/themes/components/theme-sync-report";
import { useThemeSync } from "@/features/themes/hooks/use-theme-sync";
import {
  themeSyncActions,
  useThemeSyncStore,
} from "@/features/themes/stores/use-theme-sync-store";

function ThemeSyncDialogContent() {
  const sync = useThemeSync();
  const progress = useThemeSyncStore((state) => state.progress);
  const close = () => {
    if (!sync.isBusy) themeSyncActions.setOpen(false);
  };
  const error = sync.execution.error ?? sync.inspection.error;

  return (
    <DialogContent
      className="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden sm:max-w-3xl"
      onEscapeKeyDown={(event) => {
        if (sync.isBusy) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (sync.isBusy) event.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>테마 동기화</DialogTitle>
        <DialogDescription>
          최신 JSON을 기준으로 테마와 종목 연결을 맞춥니다. 미등록 종목이 있으면
          변경 전에 중단합니다.
        </DialogDescription>
      </DialogHeader>
      <form
        className="flex min-h-0 flex-col gap-4"
        onSubmit={(event) => void sync.inspect(event)}
      >
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          <Field data-invalid={Boolean(sync.jsonError)}>
            <FieldLabel htmlFor="theme-sync-json">테마 JSON</FieldLabel>
            <Textarea
              {...sync.registration}
              aria-invalid={Boolean(sync.jsonError)}
              className="h-48 resize-y font-mono text-xs"
              disabled={sync.isBusy}
              id="theme-sync-json"
              placeholder={
                '{"fetched_at":"2026-10-20T17:38:15+09:00","source":"NAVER","themes":{"210":{"name":"자전거","stocks":[{"stock_code":"065450"}]}}}'
              }
              spellCheck={false}
            />
            <FieldDescription>
              JSON 전체 내용을 붙여 넣으세요. 종목명은 무시하고 종목 코드로
              비교합니다. 기존 테마명은 유지하며 새 테마에만 JSON의 테마명을
              사용합니다.
            </FieldDescription>
            <FieldError errors={[sync.jsonError]} />
          </Field>
          {sync.assessment && !sync.execution.isSuccess ? (
            isThemeSyncBlocked(sync.assessment) ? (
              <ThemeSyncIssues assessment={sync.assessment} />
            ) : (
              <ThemeSyncReview assessment={sync.assessment} />
            )
          ) : null}
          {sync.execution.isPending ? (
            <ThemeSyncProgressAlert progress={progress} />
          ) : null}
          {sync.execution.data ? (
            <ThemeSyncResultSummary result={sync.execution.data} />
          ) : null}
          {error ? (
            <MutationErrorAlert
              message={getErrorMessage(error)}
              title="동기화를 완료하지 못했습니다"
            />
          ) : null}
          {!sync.execution.isSuccess ? (
            <p className="text-xs text-muted-foreground">
              JSON에 없는 테마와 종목 연결은 삭제됩니다. 빈 themes는 전체 테마
              삭제를 뜻합니다. 실행 도중 실패하면 일부 변경이 남을 수 있으며,
              다시 검사하면 남은 변경만 반영합니다.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            disabled={sync.isBusy}
            type="button"
            variant="outline"
            onClick={close}
          >
            닫기
          </Button>
          <Button disabled={sync.isBusy} type="submit" variant="outline">
            {sync.inspection.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {sync.inspection.isPending ? "검사 중" : "사전 검사"}
          </Button>
          <Button
            disabled={!sync.canExecute}
            type="button"
            onClick={sync.execute}
          >
            {sync.execution.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {sync.execution.isPending ? "동기화 중" : "동기화 실행"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function ThemeSyncDialog() {
  const open = useThemeSyncStore((state) => state.open);
  const progress = useThemeSyncStore((state) => state.progress);
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!progress) themeSyncActions.setOpen(nextOpen);
      }}
    >
      {open ? <ThemeSyncDialogContent /> : null}
    </Dialog>
  );
}
