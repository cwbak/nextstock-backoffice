export const calendarEarningKeys = {
  all: ["calendar-earnings"] as const,
  lists: () => [...calendarEarningKeys.all, "list"] as const,
  us: () => [...calendarEarningKeys.lists(), "us"] as const,
  kr: () => [...calendarEarningKeys.lists(), "kr"] as const,
};
