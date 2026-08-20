import { useCallback, useEffect, useRef, type RefObject } from "react";

import {
  observeElementRect,
  useVirtualizer,
  type VirtualItem,
} from "@tanstack/react-virtual";

const virtualRowHeight = 56;
const virtualRowOverscan = 8;
const virtualizedTableFallbackRect = { height: 560, width: 0 };

function estimateVirtualRowSize() {
  return virtualRowHeight;
}

function getScrollElement(root: HTMLDivElement | null) {
  return root?.querySelector<HTMLElement>('[data-slot="table-container"]');
}

interface UseVirtualizedDataTableOptions {
  count: number;
  getItemKey: (index: number) => number | string;
  resetKey: string;
}

interface VirtualizedDataTableResult {
  bottomSpacerHeight: number;
  rootRef: RefObject<HTMLDivElement | null>;
  topSpacerHeight: number;
  virtualRows: ReadonlyArray<VirtualItem>;
}

export function useVirtualizedDataTable({
  count,
  getItemKey,
  resetKey,
}: UseVirtualizedDataTableOptions): VirtualizedDataTableResult {
  const rootRef = useRef<HTMLDivElement>(null);
  const getVirtualizerScrollElement = useCallback(
    () => getScrollElement(rootRef.current) ?? null,
    [],
  );
  // TanStack Virtual intentionally exposes mutable measurement functions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>({
    count,
    estimateSize: estimateVirtualRowSize,
    getItemKey,
    getScrollElement: getVirtualizerScrollElement,
    initialRect: virtualizedTableFallbackRect,
    observeElementRect: (instance, callback) =>
      observeElementRect(instance, (rect) => {
        callback(rect.height > 0 ? rect : virtualizedTableFallbackRect);
      }),
    overscan: virtualRowOverscan,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const firstVirtualRow = virtualRows[0];
  const lastVirtualRow = virtualRows.at(-1);

  useEffect(() => {
    const scrollElement = getVirtualizerScrollElement();

    if (scrollElement) {
      scrollElement.scrollTop = 0;
    }
  }, [getVirtualizerScrollElement, resetKey]);

  return {
    bottomSpacerHeight: lastVirtualRow
      ? Math.max(0, virtualizer.getTotalSize() - lastVirtualRow.end)
      : 0,
    rootRef,
    topSpacerHeight: firstVirtualRow?.start ?? 0,
    virtualRows,
  };
}
