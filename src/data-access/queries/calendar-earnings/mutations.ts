import { apiRequest } from "@/data-access/api/client";
import {
  createNasdaqCalendarEarningsResultSchema,
  type CreateNasdaqCalendarEarningsResult,
} from "@/data-access/schemas/calendar-earning";

export function createNasdaqCalendarEarnings(): Promise<CreateNasdaqCalendarEarningsResult> {
  return apiRequest(
    "/admin/calendar-earnings/nasdaq",
    createNasdaqCalendarEarningsResultSchema,
    { method: "POST" },
  );
}
