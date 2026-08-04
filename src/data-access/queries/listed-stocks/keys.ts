export const listedStockKeys = {
  all: ["listed-stocks"] as const,
  lists: () => [...listedStockKeys.all, "list"] as const,
  list: () => [...listedStockKeys.lists(), "all"] as const,
  details: () => [...listedStockKeys.all, "detail"] as const,
  detail: (code: string) => [...listedStockKeys.details(), code] as const,
};
