import type { KrxMarketDataListParams } from "@/data-access/schemas/krx-market-data";

export const krxMarketDataKeys = {
  all: ["krx-market-data"] as const,
  lists: () => [...krxMarketDataKeys.all, "list"] as const,
  stock: (stockCode: string) =>
    [...krxMarketDataKeys.lists(), stockCode] as const,
  list: ({ stockCode, from, to }: KrxMarketDataListParams) =>
    [...krxMarketDataKeys.stock(stockCode), { from, to }] as const,
};
