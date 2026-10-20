import type { Ref } from "react";
import { ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { SectorDepth } from "@/data-access/schemas/sector";
import { SectorRowActions } from "@/features/sectors/components/sector-row-actions";
import { sectorDepthLabels } from "@/features/sectors/sector-depth";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { cn } from "@/lib/utils";

function SectorHierarchyRow({
  row,
  selected,
  onSelect,
  controls,
}: {
  row: SectorRow;
  selected: boolean;
  onSelect: ((id: number) => void) | undefined;
  controls: string | undefined;
}) {
  return (
    <li
      className={cn(
        "flex min-w-0 items-center gap-1 border-b p-2 last:border-b-0",
        selected && "bg-accent",
      )}
    >
      {onSelect ? (
        <Button
          aria-controls={controls}
          aria-label={`${row.sector.name} 선택`}
          aria-pressed={selected}
          className="h-auto min-w-0 flex-1 justify-start gap-2 px-2 py-2.5"
          type="button"
          variant="ghost"
          onClick={() => onSelect(row.sector.id)}
        >
          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span className="w-full truncate text-left" title={row.sector.name}>
              {row.sector.name}
            </span>
            <span className="text-xs text-muted-foreground">
              #{row.sector.id} · 하위 {row.descendantCount}개
            </span>
          </span>
          <ChevronRightIcon aria-hidden="true" className="shrink-0" />
        </Button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-1 px-2 py-2.5">
          <span
            className="truncate text-sm font-medium"
            title={row.sector.name}
          >
            {row.sector.name}
          </span>
          <span className="text-xs text-muted-foreground">
            #{row.sector.id}
          </span>
        </div>
      )}
      <SectorRowActions sector={row.sector} />
    </li>
  );
}

interface SectorHierarchyColumnProps {
  columnRef?: Ref<HTMLElement>;
  controls?: string;
  depth: SectorDepth;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  onSelect?: (id: number) => void;
  rows: ReadonlyArray<SectorRow>;
  selectedId?: number | null;
}

export function SectorHierarchyColumn({
  columnRef,
  controls,
  depth,
  description,
  emptyTitle,
  emptyDescription,
  onSelect,
  rows,
  selectedId,
}: SectorHierarchyColumnProps) {
  const titleId = `sector-${depth}-heading`;
  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 snap-start flex-col"
      ref={columnRef}
    >
      <header className="flex min-h-20 items-start justify-between gap-2 border-b bg-muted/25 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-semibold" id={titleId}>
            {sectorDepthLabels[depth]}{" "}
            <span className="font-normal text-muted-foreground">({depth})</span>
          </h2>
          <p
            className="truncate text-xs text-muted-foreground"
            title={description}
          >
            {description}
          </p>
        </div>
        <Badge variant="outline">{rows.length}</Badge>
      </header>
      <div
        className="h-[min(45svh,28rem)] overflow-y-auto"
        id={`sector-${depth}-list`}
      >
        {rows.length ? (
          <ul aria-label={`${sectorDepthLabels[depth]} 목록`}>
            {rows.map((row) => (
              <SectorHierarchyRow
                controls={controls}
                key={row.sector.id}
                onSelect={onSelect}
                row={row}
                selected={selectedId === row.sector.id}
              />
            ))}
          </ul>
        ) : (
          <Empty className="min-h-48 border-0 p-4">
            <EmptyHeader>
              <EmptyTitle className="text-sm">{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  );
}
