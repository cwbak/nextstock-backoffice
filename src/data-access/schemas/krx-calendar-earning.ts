import { z } from "zod";

export const krxCalendarEarningMarketTypeSchema = z.enum(["KOSPI", "KOSDAQ"]);

export const krxCalendarEarningSchema = z
  .object({
    code: z.string().regex(/^[A-Z0-9]{6}$/),
    name: z.string().min(1),
    marketType: krxCalendarEarningMarketTypeSchema,
    marketCap: z.null(),
    reportDate: z.iso.date(),
    reportTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
  })
  .strict();

export const krxCalendarEarningListSchema = z.array(krxCalendarEarningSchema);

export type KrxCalendarEarning = z.infer<typeof krxCalendarEarningSchema>;
export type KrxCalendarEarningMarketType = z.infer<
  typeof krxCalendarEarningMarketTypeSchema
>;
