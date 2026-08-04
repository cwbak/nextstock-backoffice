import { z } from "zod";

import { corporationCodeSchema } from "@/data-access/schemas/corporation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const listedStockCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{6}$/, "종목 코드는 대문자 또는 숫자 6자리여야 합니다.");

export const marketTypeSchema = z.enum(["KOSPI", "KOSDAQ"]);

export const stockTypeSchema = z
  .string()
  .trim()
  .min(1, "주식 종류를 입력해 주세요.");

const listDateSchema = z
  .string()
  .regex(datePattern, "상장일은 YYYY-MM-DD 형식이어야 합니다.");

const parvalSchema = z
  .number({ error: "액면가는 숫자여야 합니다." })
  .int("액면가는 정수여야 합니다.")
  .min(0, "액면가는 0 이상이어야 합니다.")
  .nullable();

const listedSharesSchema = z
  .number({ error: "상장주식수는 숫자여야 합니다." })
  .int("상장주식수는 정수여야 합니다.")
  .min(0, "상장주식수는 0 이상이어야 합니다.")
  .nullable();

const optionalParvalResponseSchema = parvalSchema
  .optional()
  .transform((value) => value ?? null);

const optionalListedSharesResponseSchema = listedSharesSchema
  .optional()
  .transform((value) => value ?? null);

export const listedStockSchema = z
  .object({
    code: listedStockCodeSchema,
    corporationCode: corporationCodeSchema,
    name: z.string().min(1),
    marketType: marketTypeSchema,
    stockType: stockTypeSchema,
    listDd: listDateSchema,
    parval: optionalParvalResponseSchema,
    listShrs: optionalListedSharesResponseSchema,
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const listedStockListSchema = z.array(listedStockSchema);

export const listedStockFormSchema = z
  .object({
    code: listedStockCodeSchema,
    corporationCode: corporationCodeSchema,
    name: z.string().trim().min(1, "종목명을 입력해 주세요."),
    marketType: marketTypeSchema,
    stockType: stockTypeSchema,
    listDd: listDateSchema,
    parval: parvalSchema,
    listShrs: listedSharesSchema,
  })
  .strict();

export const listedStockCreatePayloadSchema = z
  .object({
    corporationCode: corporationCodeSchema,
    stockCode: listedStockCodeSchema,
  })
  .strict();

export const listedStockUpdatePayloadSchema = listedStockFormSchema.omit({
  code: true,
});

export type ListedStock = z.infer<typeof listedStockSchema>;
export type ListedStockFormValues = z.infer<typeof listedStockFormSchema>;
export type ListedStockCreatePayload = z.infer<
  typeof listedStockCreatePayloadSchema
>;
export type ListedStockUpdatePayload = z.infer<
  typeof listedStockUpdatePayloadSchema
>;
