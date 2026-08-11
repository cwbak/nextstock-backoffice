import { z } from "zod";

import { krxStockCodeSchema } from "@/data-access/schemas/krx-stock";

const marketDataDateSchema = z.iso.date({
  error: "날짜는 YYYY-MM-DD 형식이어야 합니다.",
});
const optionalMarketDataDateSchema = z.union([
  z.literal(""),
  marketDataDateSchema,
]);
const marketDataIntegerSchema = z.number().int().nonnegative();

function isValidDateRange({ from, to }: { from: string; to: string }) {
  return !from || !to || from <= to;
}

export const krxMarketDataSchema = z
  .object({
    date: marketDataDateSchema,
    open: marketDataIntegerSchema,
    low: marketDataIntegerSchema,
    high: marketDataIntegerSchema,
    close: marketDataIntegerSchema,
    volume: marketDataIntegerSchema,
    value: marketDataIntegerSchema,
  })
  .strict();

export const krxMarketDataListSchema = z.array(krxMarketDataSchema);

export const krxMarketDataListParamsSchema = z
  .object({
    stockCode: krxStockCodeSchema,
    from: optionalMarketDataDateSchema,
    to: optionalMarketDataDateSchema,
  })
  .strict()
  .refine(isValidDateRange, {
    message: "종료일은 시작일보다 빠를 수 없습니다.",
    path: ["to"],
  });

export const krxMarketDataCreatePayloadSchema = z
  .object({
    stockCode: krxStockCodeSchema,
    from: marketDataDateSchema,
    to: marketDataDateSchema,
  })
  .strict()
  .refine(isValidDateRange, {
    message: "종료일은 시작일보다 빠를 수 없습니다.",
    path: ["to"],
  });

export const krxMarketDataCreateResultSchema = z
  .object({
    fetchedCount: z.number().int().nonnegative(),
    insertedCount: z.number().int().nonnegative(),
  })
  .strict();

export type KrxMarketData = z.infer<typeof krxMarketDataSchema>;
export type KrxMarketDataListParams = z.infer<
  typeof krxMarketDataListParamsSchema
>;
export type KrxMarketDataCreatePayload = z.infer<
  typeof krxMarketDataCreatePayloadSchema
>;
export type KrxMarketDataCreateResult = z.infer<
  typeof krxMarketDataCreateResultSchema
>;
