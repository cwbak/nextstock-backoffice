import { Badge } from "@/components/ui/badge";
import { krStockStatusLabels } from "@/components/common/kr-stock-status";
import type { KrStockStatus } from "@/data-access/schemas/kr-stock";

const krStockStatusVariants = {
  ACTIVE: "default",
  LISTING_SCHEDULED: "secondary",
  DELISTED: "outline",
  SUSPENDED: "destructive",
} as const satisfies Readonly<
  Record<KrStockStatus, "default" | "secondary" | "outline" | "destructive">
>;

interface KrStockStatusBadgeProps {
  status: KrStockStatus;
}

export function KrStockStatusBadge({ status }: KrStockStatusBadgeProps) {
  return (
    <Badge variant={krStockStatusVariants[status]}>
      {krStockStatusLabels[status]}
    </Badge>
  );
}
