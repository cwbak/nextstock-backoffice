export const sectorKeys = {
  all: ["sectors"] as const,
  lists: () => [...sectorKeys.all, "list"] as const,
  list: () => [...sectorKeys.lists(), "all"] as const,
  details: () => [...sectorKeys.all, "detail"] as const,
  detail: (id: number) => [...sectorKeys.details(), id] as const,
  stockLists: () => [...sectorKeys.all, "stocks"] as const,
  stocks: (id: number) => [...sectorKeys.stockLists(), id] as const,
  writes: () => [...sectorKeys.all, "write"] as const,
};
