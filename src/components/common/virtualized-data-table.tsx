import {
  useLayoutEffect,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function getScrollElement(root: HTMLDivElement | null) {
  return root?.querySelector<HTMLElement>('[data-slot="table-container"]');
}

interface VirtualizedDataTableViewportProps {
  children: ReactNode;
  label: string;
  rootRef: RefObject<HTMLDivElement | null>;
}

export function VirtualizedDataTableViewport({
  children,
  label,
  rootRef,
}: VirtualizedDataTableViewportProps) {
  useLayoutEffect(() => {
    const scrollElement = getScrollElement(rootRef.current);

    if (!scrollElement) {
      return;
    }

    scrollElement.setAttribute("aria-label", label);
    scrollElement.setAttribute("role", "region");
    scrollElement.tabIndex = 0;
  }, [label, rootRef]);

  return (
    <div
      className="h-full min-h-0 min-w-0 [&_[data-slot=table-container]]:h-full [&_[data-slot=table-container]]:overscroll-contain [&_[data-slot=table-container]]:overflow-auto [&_[data-slot=table-container]]:focus-visible:outline-none [&_[data-slot=table-container]]:focus-visible:ring-2 [&_[data-slot=table-container]]:focus-visible:ring-ring [&_[data-slot=table-container]]:focus-visible:ring-inset"
      ref={rootRef}
    >
      {children}
    </div>
  );
}

interface VirtualizedDataTableSpacerProps {
  columnCount: number;
  height: number;
}

export function VirtualizedDataTableSpacer({
  columnCount,
  height,
}: VirtualizedDataTableSpacerProps) {
  if (height <= 0) {
    return null;
  }

  return (
    <TableRow
      aria-hidden="true"
      className="pointer-events-none border-0 hover:bg-transparent"
      style={{ height }}
    >
      <TableCell className="h-0 p-0" colSpan={columnCount} />
    </TableRow>
  );
}

export function VirtualizedDataTableRow({
  className,
  ...props
}: ComponentProps<typeof TableRow>) {
  return <TableRow className={cn("h-14", className)} {...props} />;
}
