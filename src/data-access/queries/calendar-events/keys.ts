export const calendarEventKeys = {
  all: ["calendar-events"] as const,
  lists: () => [...calendarEventKeys.all, "list"] as const,
  list: () => [...calendarEventKeys.lists(), "all"] as const,
};
