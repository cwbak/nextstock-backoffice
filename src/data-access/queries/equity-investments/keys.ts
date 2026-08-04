export const equityInvestmentKeys = {
  all: ["equity-investments"] as const,
  lists: () => [...equityInvestmentKeys.all, "list"] as const,
  list: () => [...equityInvestmentKeys.lists(), "all"] as const,
};
