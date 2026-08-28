import { apiRequest } from "@/data-access/api/client";
import {
  holidaysSyncJobRegistrationSchema,
  type BackgroundJobRegistration,
} from "@/data-access/schemas/background-job";
import {
  holidaySyncPayloadSchema,
  type HolidaySyncPayload,
} from "@/data-access/schemas/holiday";

export function syncHolidays(
  payload: HolidaySyncPayload,
): Promise<BackgroundJobRegistration> {
  const parsedPayload = holidaySyncPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/calendar/holidays/sync",
    holidaysSyncJobRegistrationSchema,
    { method: "POST" },
    parsedPayload,
  );
}
