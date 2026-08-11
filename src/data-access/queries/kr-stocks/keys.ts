export const krStockKeys = {
  all: ["kr-stocks"] as const,
  lists: () => [...krStockKeys.all, "list"] as const,
  list: () => [...krStockKeys.lists(), "all"] as const,
  details: () => [...krStockKeys.all, "detail"] as const,
  detail: (code: string) => [...krStockKeys.details(), code] as const,
};
