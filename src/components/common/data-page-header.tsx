import type { ReactNode } from "react";

interface DataPageHeaderProps {
  actions: ReactNode;
  description: string;
  eyebrow: string;
  recordCount: number;
  title: string;
}

export function DataPageHeader({
  actions,
  description,
  eyebrow,
  recordCount,
  title,
}: DataPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b pb-6 @3xl/main:flex-row @3xl/main:items-end @3xl/main:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
          Admin registry / {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-live="polite"
          className="mr-1 font-mono text-xs tabular-nums text-muted-foreground"
        >
          {recordCount.toLocaleString("ko-KR")} records
        </span>
        {actions}
      </div>
    </header>
  );
}
