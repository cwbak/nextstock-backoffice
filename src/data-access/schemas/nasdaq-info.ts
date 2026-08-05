import { z } from "zod";

export const nasdaqInfoSchema = z
  .object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    marketCap: z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/)
      .nullable(),
    country: z.string().nullable(),
    ipoYear: z.number().int().nullable(),
    sector: z.string().nullable(),
    industry: z.string().nullable(),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const nasdaqInfoListSchema = z.array(nasdaqInfoSchema);

export const nasdaqInfoUploadResultSchema = z
  .object({
    processedCount: z.number().int().min(0),
    upsertedCount: z.number().int().min(0),
  })
  .strict();

export type NasdaqInfo = z.infer<typeof nasdaqInfoSchema>;
export type NasdaqInfoUploadResult = z.infer<
  typeof nasdaqInfoUploadResultSchema
>;
