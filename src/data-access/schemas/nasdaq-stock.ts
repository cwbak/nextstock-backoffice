import { z } from "zod";

export const nasdaqStockSchema = z
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
    isSp500: z.boolean(),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const nasdaqStockListSchema = z.array(nasdaqStockSchema);

export const nasdaqStockUploadResultSchema = z
  .object({
    processedCount: z.number().int().min(0),
    upsertedCount: z.number().int().min(0),
  })
  .strict();

export type NasdaqStock = z.infer<typeof nasdaqStockSchema>;
export type NasdaqStockUploadResult = z.infer<
  typeof nasdaqStockUploadResultSchema
>;
