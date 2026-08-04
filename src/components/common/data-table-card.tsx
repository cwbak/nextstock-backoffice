import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataTableCardProps {
  children: ReactNode;
  description: string;
  recordCount: number;
  title: string;
}

export function DataTableCard({
  children,
  description,
  recordCount,
  title,
}: DataTableCardProps) {
  return (
    <Card className="min-w-0 gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="font-mono text-xs tabular-nums text-muted-foreground">
          {recordCount.toLocaleString("ko-KR")}
        </CardAction>
      </CardHeader>
      <CardContent className="min-w-0 contain-[inline-size_layout_paint] p-0">
        {children}
      </CardContent>
    </Card>
  );
}
