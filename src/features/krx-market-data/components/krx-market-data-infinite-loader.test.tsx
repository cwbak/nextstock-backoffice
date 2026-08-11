import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KrxMarketDataInfiniteLoader } from "@/features/krx-market-data/components/krx-market-data-infinite-loader";

describe("KrxMarketDataInfiniteLoader", () => {
  let intersectionCallback: IntersectionObserverCallback;
  const observeMock = vi.fn();
  const disconnectMock = vi.fn();

  beforeEach(() => {
    observeMock.mockClear();
    disconnectMock.mockClear();

    class IntersectionObserverMock implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly scrollMargin = "";
      readonly thresholds = [];

      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }

      disconnect = disconnectMock;
      observe = observeMock;
      takeRecords = () => [];
      unobserve = vi.fn();
    }

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("하단 감지 영역이 보이면 이전 캔들을 자동으로 요청한다", () => {
    const onLoadMore = vi.fn();

    render(
      <KrxMarketDataInfiniteLoader
        error={null}
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "이전 캔들 더 불러오기" }),
    ).toBeInTheDocument();
    expect(observeMock).toHaveBeenCalledOnce();

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
