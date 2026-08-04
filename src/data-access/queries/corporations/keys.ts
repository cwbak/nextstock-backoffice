export const corporationKeys = {
  all: ["corporations"] as const,
  lists: () => [...corporationKeys.all, "list"] as const,
  list: () => [...corporationKeys.lists(), "all"] as const,
  industries: () => [...corporationKeys.all, "industry"] as const,
  industry: (code: string) => [...corporationKeys.industries(), code] as const,
};
