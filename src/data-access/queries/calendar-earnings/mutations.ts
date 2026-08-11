import { apiRequest } from "@/data-access/api/client";
import {
  createUsCalendarEarningsResultSchema,
  type CreateUsCalendarEarningsResult,
} from "@/data-access/schemas/us-calendar-earning";

export function createUsCalendarEarnings(): Promise<CreateUsCalendarEarningsResult> {
  return apiRequest(
    "/admin/calendar-earnings/us",
    createUsCalendarEarningsResultSchema,
    { method: "POST" },
  );
}
