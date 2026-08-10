import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface DataTableCardProps {
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  description: string;
  recordCount: number;
  title: string;
}

export function DataTableCard({
  actions,
  children,
  description,
  className,
  contentClassName,
  recordCount,
  title,
}: DataTableCardProps) {
  return (
    <Card className={cn("min-w-0 gap-0 py-0", className)}>
      <CardHeader className="border-b py-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {recordCount.toLocaleString("ko-KR")}
          </span>
          {actions}
        </CardAction>
      </CardHeader>
      <CardContent
        className={cn(
          "min-w-0 contain-[inline-size_layout_paint] p-0",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
