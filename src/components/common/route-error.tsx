import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <section
      aria-labelledby="route-error-title"
      className="mx-auto flex min-h-72 max-w-lg flex-col items-start justify-center gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Route error
        </p>
        <h1
          id="route-error-title"
          className="text-pretty text-xl font-semibold"
        >
          화면을 불러오지 못했습니다
        </h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => void router.invalidate()}
      >
        <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        다시 시도
      </Button>
    </section>
  );
}
