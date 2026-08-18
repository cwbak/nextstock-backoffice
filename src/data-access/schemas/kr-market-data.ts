import { z } from "zod";

import { krStockCodeSchema } from "@/data-access/schemas/kr-stock";

const marketDataDateSchema = z.iso.date({
  error: "날짜는 YYYY-MM-DD 형식이어야 합니다.",
});
const marketDataIntegerSchema = z.number().int().nonnegative();

export const krMarketDataPeriodSchema = z.enum(["daily", "weekly", "monthly"], {
  error: "캔들 주기는 일봉, 주봉, 월봉 중에서 선택해 주세요.",
});

function isValidDateRange({ from, to }: { from: string; to: string }) {
  return !from || !to || from <= to;
}

export const krMarketDataSchema = z
  .object({
    period: krMarketDataPeriodSchema,
    date: marketDataDateSchema,
    open: marketDataIntegerSchema,
    low: marketDataIntegerSchema,
    high: marketDataIntegerSchema,
    close: marketDataIntegerSchema,
    priceChange: z.number().int(),
    volume: marketDataIntegerSchema,
    value: marketDataIntegerSchema,
  })
  .strict();

export const krMarketDataListSchema = z.array(krMarketDataSchema);

export const krMarketDataListParamsSchema = z
  .object({
    stockCode: krStockCodeSchema,
    period: krMarketDataPeriodSchema,
    end: marketDataDateSchema,
    limit: z.number().int().min(1).max(1_000),
  })
  .strict();

export const krMarketDataFilterSchema = z
  .object({
    stockCode: krStockCodeSchema,
    period: krMarketDataPeriodSchema,
  })
  .strict();

export const krMarketDataCreateAllPayloadSchema = z
  .object({
    from: marketDataDateSchema,
    to: marketDataDateSchema,
  })
  .strict()
  .refine(isValidDateRange, {
    message: "종료일은 시작일보다 빠를 수 없습니다.",
    path: ["to"],
  });

export const krMarketDataCreatePayloadSchema = z
  .object({
    stockCode: krStockCodeSchema,
    from: marketDataDateSchema,
    to: marketDataDateSchema,
  })
  .strict()
  .refine(isValidDateRange, {
    message: "종료일은 시작일보다 빠를 수 없습니다.",
    path: ["to"],
  });

export const krMarketDataCreateResultSchema = z
  .object({
    fetchedCount: z.number().int().nonnegative(),
    insertedCount: z.number().int().nonnegative(),
  })
  .strict();

export const krMarketDataKisDailyResultSchema = z
  .object({
    from: marketDataDateSchema,
    to: marketDataDateSchema,
    stockCount: z.number().int().nonnegative(),
    processedCount: z.number().int().nonnegative(),
    failedCount: z.number().int().nonnegative(),
    fetchedCount: z.number().int().nonnegative(),
    insertedCount: z.number().int().nonnegative(),
  })
  .strict()
  .refine(isValidDateRange, {
    message: "종료일은 시작일보다 빠를 수 없습니다.",
    path: ["to"],
  });

export type KrMarketData = z.infer<typeof krMarketDataSchema>;
export type KrMarketDataPeriod = z.infer<typeof krMarketDataPeriodSchema>;
export type KrMarketDataFilterValues = z.infer<typeof krMarketDataFilterSchema>;
export type KrMarketDataListParams = z.infer<
  typeof krMarketDataListParamsSchema
>;
export type KrMarketDataCreatePayload = z.infer<
  typeof krMarketDataCreatePayloadSchema
>;
export type KrMarketDataCreateAllPayload = z.infer<
  typeof krMarketDataCreateAllPayloadSchema
>;
export type KrMarketDataCreateResult = z.infer<
  typeof krMarketDataCreateResultSchema
>;
export type KrMarketDataKisDailyResult = z.infer<
  typeof krMarketDataKisDailyResultSchema
>;
