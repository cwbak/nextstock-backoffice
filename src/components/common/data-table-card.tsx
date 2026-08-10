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
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  description: string;
  recordCount: number;
  title: string;
}

export function DataTableCard({
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
        <CardAction className="font-mono text-xs tabular-nums text-muted-foreground">
          {recordCount.toLocaleString("ko-KR")}
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
