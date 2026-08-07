export const calendarEarningKeys = {
  all: ["calendar-earnings"] as const,
  lists: () => [...calendarEarningKeys.all, "list"] as const,
  list: () => [...calendarEarningKeys.lists(), "all"] as const,
};
