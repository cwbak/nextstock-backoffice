import {
  krStockStatusSchema,
  type KrStockStatus,
} from "@/data-access/schemas/kr-stock";

export const krStockStatusLabels: Readonly<Record<KrStockStatus, string>> = {
  ACTIVE: "정상",
  LISTING_SCHEDULED: "상장 예정",
  DELISTED: "상장 폐지",
  SUSPENDED: "거래 정지",
};

export const krStockStatusOptions = krStockStatusSchema.options.map(
  (value) => ({
    label: krStockStatusLabels[value],
    value,
  }),
);
