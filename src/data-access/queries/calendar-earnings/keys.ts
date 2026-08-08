export const calendarEarningKeys = {
  all: ["calendar-earnings"] as const,
  lists: () => [...calendarEarningKeys.all, "list"] as const,
  nasdaq: () => [...calendarEarningKeys.lists(), "nasdaq"] as const,
  krx: () => [...calendarEarningKeys.lists(), "krx"] as const,
};
