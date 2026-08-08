import { z } from "zod";

export const calendarEarningSchema = z
  .object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    marketCap: z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/)
      .nullable(),
    isSp500: z.boolean(),
    reportDate: z.iso.date(),
    reportTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
  })
  .strict();

export const calendarEarningListSchema = z.array(calendarEarningSchema);

export const createNasdaqCalendarEarningsResultSchema = z
  .object({
    fetchedCount: z.number().int().min(0),
    insertedCount: z.number().int().min(0),
    skippedCount: z.number().int().min(0),
  })
  .strict();

export type CalendarEarning = z.infer<typeof calendarEarningSchema>;
export type CreateNasdaqCalendarEarningsResult = z.infer<
  typeof createNasdaqCalendarEarningsResultSchema
>;
