export const usStockKeys = {
  all: ["us-stocks"] as const,
  lists: () => [...usStockKeys.all, "list"] as const,
  list: () => [...usStockKeys.lists(), "all"] as const,
};
