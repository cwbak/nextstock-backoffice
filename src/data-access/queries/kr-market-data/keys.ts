import type { KrMarketDataListParams } from "@/data-access/schemas/kr-market-data";

export const krMarketDataKeys = {
  all: ["kr-market-data"] as const,
  lists: () => [...krMarketDataKeys.all, "list"] as const,
  stock: (stockCode: string) =>
    [...krMarketDataKeys.lists(), stockCode] as const,
  list: ({ stockCode, period, end, limit }: KrMarketDataListParams) =>
    [...krMarketDataKeys.stock(stockCode), { period, end, limit }] as const,
};
