export const krxStockKeys = {
  all: ["krx-stocks"] as const,
  lists: () => [...krxStockKeys.all, "list"] as const,
  list: () => [...krxStockKeys.lists(), "all"] as const,
  details: () => [...krxStockKeys.all, "detail"] as const,
  detail: (code: string) => [...krxStockKeys.details(), code] as const,
};
