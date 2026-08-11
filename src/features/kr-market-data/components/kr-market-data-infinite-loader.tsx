import { useEffect, useEffectEvent, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/data-access/api/client";

interface KrMarketDataInfiniteLoaderProps {
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function KrMarketDataInfiniteLoader({
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
}: KrMarketDataInfiniteLoaderProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const loadMore = useEffectEvent(onLoadMore);

  useEffect(() => {
    const trigger = triggerRef.current;

    if (
      !trigger ||
      !hasNextPage ||
      isFetchingNextPage ||
      error ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [error, hasNextPage, isFetchingNextPage]);

  return (
    <div
      aria-live="polite"
      className="flex min-h-16 items-center justify-center border-t px-4 py-3 text-sm text-muted-foreground"
      ref={triggerRef}
    >
      {isFetchingNextPage ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          이전 캔들을 불러오는 중입니다.
        </span>
      ) : error ? (
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          {getErrorMessage(error)}
          <Button size="sm" type="button" variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        </span>
      ) : hasNextPage ? (
        <Button size="sm" type="button" variant="ghost" onClick={onLoadMore}>
          이전 캔들 더 불러오기
        </Button>
      ) : (
        <span>가장 오래된 캔들까지 불러왔습니다.</span>
      )}
    </div>
  );
}
