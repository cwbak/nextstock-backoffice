import { z } from "zod";

export const krCalendarEarningMarketTypeSchema = z.enum(["KOSPI", "KOSDAQ"]);

export const krCalendarEarningSchema = z
  .object({
    code: z.string().regex(/^[A-Z0-9]{6}$/),
    name: z.string().min(1),
    marketType: krCalendarEarningMarketTypeSchema,
    marketCap: z.null(),
    reportDate: z.iso.date(),
    reportTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
  })
  .strict();

export const krCalendarEarningListSchema = z.array(krCalendarEarningSchema);

export type KrCalendarEarning = z.infer<typeof krCalendarEarningSchema>;
export type KrCalendarEarningMarketType = z.infer<
  typeof krCalendarEarningMarketTypeSchema
>;
