import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RouteNotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="mx-auto flex min-h-72 max-w-lg flex-col items-start justify-center gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          404
        </p>
        <h1 id="not-found-title" className="text-pretty text-xl font-semibold">
          요청한 화면이 없습니다
        </h1>
      </div>
      <Button asChild variant="outline">
        <Link to="/">
          <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
          홈으로 이동
        </Link>
      </Button>
    </section>
  );
}
