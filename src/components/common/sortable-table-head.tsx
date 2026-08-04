import type { ComponentProps } from "react";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc";

interface SortableTableHeadProps extends Omit<
  ComponentProps<typeof TableHead>,
  "children"
> {
  direction: SortDirection | null;
  label: string;
  onSort: () => void;
}

export function SortableTableHead({
  className,
  direction,
  label,
  onSort,
  ...props
}: SortableTableHeadProps) {
  const nextDirection = direction === "asc" ? "desc" : "asc";
  const Icon =
    direction === "asc"
      ? ArrowUpIcon
      : direction === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;

  return (
    <TableHead
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : "none"
      }
      className={cn("px-0", className)}
      {...props}
    >
      <button
        aria-label={`${label} ${nextDirection === "asc" ? "오름차순" : "내림차순"} 정렬`}
        className="flex h-10 w-full items-center gap-1.5 rounded-sm px-2 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        type="button"
        onClick={onSort}
      >
        <span>{label}</span>
        <Icon
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0",
            direction === null && "text-muted-foreground/70",
          )}
        />
      </button>
    </TableHead>
  );
}
