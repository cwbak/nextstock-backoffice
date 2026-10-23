import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KrMarketDataInfiniteLoader } from "@/features/kr-market-data/components/kr-market-data-infinite-loader";

describe("KrMarketDataInfiniteLoader", () => {
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
      <KrMarketDataInfiniteLoader
        error={null}
        hasNextPage
        isFetching={false}
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

  it("새로고침 중 자동·수동 추가 조회를 멈추고 완료 후 하단 감지를 재개한다", () => {
    const onLoadMore = vi.fn();
    const loader = (isFetching: boolean) => (
      <KrMarketDataInfiniteLoader
        error={null}
        hasNextPage
        isFetching={isFetching}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
        onRetry={vi.fn()}
      />
    );
    const { rerender } = render(loader(false));
    const loadMore = screen.getByRole("button", {
      name: "이전 캔들 더 불러오기",
    });

    rerender(loader(true));
    expect(disconnectMock).toHaveBeenCalledOnce();
    expect(observeMock).toHaveBeenCalledOnce();
    expect(loadMore).toBeDisabled();
    fireEvent.click(loadMore);
    expect(onLoadMore).not.toHaveBeenCalled();

    rerender(loader(false));
    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(loadMore).toBeEnabled();
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
