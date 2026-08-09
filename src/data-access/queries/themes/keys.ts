export const themeKeys = {
  all: ["themes"] as const,
  lists: () => [...themeKeys.all, "list"] as const,
  list: () => [...themeKeys.lists(), "all"] as const,
  stockLists: () => [...themeKeys.all, "stocks"] as const,
  stocks: (themeId: number) => [...themeKeys.stockLists(), themeId] as const,
};
