import { z } from "zod";

import { corporationCodeSchema } from "@/data-access/schemas/corporation";

export const equityInvestmentSchema = z
  .object({
    corpCode: corporationCodeSchema,
    invName: z.string().min(1),
    bsnsYear: z.number().int(),
    status: z.literal("OK"),
    trmendBlceQotaRt: z.string().min(1).nullable(),
  })
  .strict();

export const equityInvestmentListSchema = z.array(equityInvestmentSchema);

export const equityInvestmentPeriodSchema = z
  .object({
    bsnsYear: z.string().regex(/^\d{4}$/, "사업연도는 숫자 4자리여야 합니다."),
    reprtCode: z
      .number()
      .int()
      .min(1, "보고서 구분을 선택해 주세요.")
      .max(4, "보고서 구분을 선택해 주세요."),
  })
  .strict();

const equityInvestmentCountsSchema = z
  .object({
    fetchedCount: z.number().int().min(0),
    upsertedCount: z.number().int().min(0),
  })
  .strict();

export const equityInvestmentCreatePayloadSchema = equityInvestmentPeriodSchema
  .extend({
    corpCode: corporationCodeSchema,
  })
  .strict();

export const equityInvestmentCreateResultSchema = equityInvestmentPeriodSchema
  .extend({
    corpCode: corporationCodeSchema,
    ...equityInvestmentCountsSchema.shape,
  })
  .strict();

export const equityInvestmentBulkCreatePayloadSchema =
  equityInvestmentPeriodSchema;

export const equityInvestmentBulkCreateResultSchema =
  equityInvestmentPeriodSchema
    .extend({
      corporationCount: z.number().int().min(0),
      processedCount: z.number().int().min(0),
      failedCount: z.number().int().min(0),
      ...equityInvestmentCountsSchema.shape,
    })
    .strict();

export type EquityInvestment = z.infer<typeof equityInvestmentSchema>;
export type EquityInvestmentPeriod = z.infer<
  typeof equityInvestmentPeriodSchema
>;
export type EquityInvestmentCreatePayload = z.infer<
  typeof equityInvestmentCreatePayloadSchema
>;
export type EquityInvestmentCreateResult = z.infer<
  typeof equityInvestmentCreateResultSchema
>;
export type EquityInvestmentBulkCreatePayload = z.infer<
  typeof equityInvestmentBulkCreatePayloadSchema
>;
export type EquityInvestmentBulkCreateResult = z.infer<
  typeof equityInvestmentBulkCreateResultSchema
>;
