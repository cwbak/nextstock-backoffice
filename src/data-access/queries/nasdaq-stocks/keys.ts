export const nasdaqStockKeys = {
  all: ["nasdaq-stocks"] as const,
  lists: () => [...nasdaqStockKeys.all, "list"] as const,
  list: () => [...nasdaqStockKeys.lists(), "all"] as const,
};
