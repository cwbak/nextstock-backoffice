export const nasdaqInfoKeys = {
  all: ["nasdaq-info"] as const,
  lists: () => [...nasdaqInfoKeys.all, "list"] as const,
  list: () => [...nasdaqInfoKeys.lists(), "all"] as const,
};
