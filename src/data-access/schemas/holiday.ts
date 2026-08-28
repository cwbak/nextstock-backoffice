import { z } from "zod";

const holidayYearSchema = z
  .number({ error: "연도를 입력해 주세요." })
  .int("연도는 정수여야 합니다.")
  .min(1000, "연도는 네 자리 숫자여야 합니다.")
  .max(9999, "연도는 네 자리 숫자여야 합니다.");

export const holidaySyncPayloadSchema = z
  .object({
    fromYear: holidayYearSchema,
    toYear: holidayYearSchema,
  })
  .strict()
  .refine(({ fromYear, toYear }) => fromYear <= toYear, {
    message: "종료 연도는 시작 연도보다 빠를 수 없습니다.",
    path: ["toYear"],
  });

export const holidaySyncResultSchema = z
  .object({
    fetchedCount: z.number().int().nonnegative(),
    upsertedCount: z.number().int().nonnegative(),
  })
  .strict();

export type HolidaySyncPayload = z.infer<typeof holidaySyncPayloadSchema>;
export type HolidaySyncResult = z.infer<typeof holidaySyncResultSchema>;
