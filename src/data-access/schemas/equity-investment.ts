import { z } from "zod";

import { corporationCodeSchema } from "@/data-access/schemas/corporation";

export const equityInvestmentSchema = z
  .object({
    corpCode: corporationCodeSchema,
    invName: z.string().min(1),
    trmendBlceQotaRt: z.string().min(1).nullable(),
  })
  .strict();

export const equityInvestmentListSchema = z.array(equityInvestmentSchema);

const equityInvestmentCountsSchema = z
  .object({
    fetchedCount: z.number().int().min(0),
    upsertedCount: z.number().int().min(0),
  })
  .strict();

export const equityInvestmentCreatePayloadSchema = z
  .object({
    corpCode: corporationCodeSchema,
  })
  .strict();

export const equityInvestmentCreateResultSchema = equityInvestmentCountsSchema
  .extend({
    corpCode: corporationCodeSchema,
  })
  .strict();

export const equityInvestmentBulkCreateResultSchema =
  equityInvestmentCountsSchema
    .extend({
      corporationCount: z.number().int().min(0),
      processedCount: z.number().int().min(0),
      failedCount: z.number().int().min(0),
    })
    .strict();

export type EquityInvestment = z.infer<typeof equityInvestmentSchema>;
export type EquityInvestmentCreatePayload = z.infer<
  typeof equityInvestmentCreatePayloadSchema
>;
export type EquityInvestmentCreateResult = z.infer<
  typeof equityInvestmentCreateResultSchema
>;
export type EquityInvestmentBulkCreateResult = z.infer<
  typeof equityInvestmentBulkCreateResultSchema
>;
