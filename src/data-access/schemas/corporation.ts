import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const corporationCodeSchema = z
  .string()
  .regex(/^\d{8}$/, "법인 코드는 숫자 8자리여야 합니다.");

const dateSchema = z
  .string()
  .regex(datePattern, "날짜는 YYYY-MM-DD 형식이어야 합니다.");

export const corporationInfoSchema = z
  .object({
    summary: z.array(z.string()),
    product: z.array(z.string()),
  })
  .strict();

export const corporationSchema = z
  .object({
    code: corporationCodeSchema,
    name: z.string().min(1),
    nameEn: z.string(),
    ceoNm: z.string().min(1),
    hmUrl: z.string().nullable(),
    address: z.string().min(1),
    estDt: dateSchema,
    accMt: z.number().int().min(1).max(12),
    indutyCode: z.string().regex(/^\d+$/),
    info: corporationInfoSchema.nullable(),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const corporationListSchema = z.array(corporationSchema);

export const corporationUpsertPayloadSchema = z
  .object({
    code: corporationCodeSchema,
  })
  .strict();

export const corporationSyncResultSchema = z
  .object({
    corporationFetchedCount: z.number().int().nonnegative(),
    corporationNameFetchedCount: z.number().int().nonnegative(),
    corporationNameInsertedCount: z.number().int().nonnegative(),
    corporationUpdatedCount: z.number().int().nonnegative(),
  })
  .strict();

export const corporationFormSchema = z
  .object({
    code: corporationCodeSchema,
    name: z.string().trim().min(1, "법인명을 입력해 주세요."),
    nameEn: z.string().trim(),
    ceoNm: z.string().trim().min(1, "대표자명을 입력해 주세요."),
    hmUrl: z.string().trim(),
    address: z.string().trim().min(1, "주소를 입력해 주세요."),
    estDt: dateSchema,
    accMt: z
      .number()
      .int("결산월은 정수여야 합니다.")
      .min(1, "결산월은 1 이상이어야 합니다.")
      .max(12, "결산월은 12 이하여야 합니다."),
    indutyCode: z
      .string()
      .regex(/^\d+$/, "업종 코드는 숫자만 입력할 수 있습니다."),
    summary: z.string(),
    products: z.string(),
  })
  .strict();

export const corporationBasicPayloadSchema = corporationFormSchema
  .pick({
    name: true,
    nameEn: true,
    ceoNm: true,
    address: true,
    estDt: true,
    accMt: true,
    indutyCode: true,
  })
  .extend({
    hmUrl: z.string().nullable(),
  })
  .strict();

export const corporationInfoPayloadSchema = z
  .object({
    info: corporationInfoSchema.nullable(),
  })
  .strict();

function parseListInput(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildCorporationInfo(
  values: Pick<CorporationFormValues, "summary" | "products">,
): CorporationInfo | null {
  const summary = parseListInput(values.summary);
  const product = parseListInput(values.products);

  if (summary.length === 0 && product.length === 0) {
    return null;
  }

  return { product, summary };
}

export type CorporationInfo = z.infer<typeof corporationInfoSchema>;
export type Corporation = z.infer<typeof corporationSchema>;
export type CorporationUpsertPayload = z.infer<
  typeof corporationUpsertPayloadSchema
>;
export type CorporationSyncResult = z.infer<typeof corporationSyncResultSchema>;
export type CorporationFormValues = z.infer<typeof corporationFormSchema>;
export type CorporationBasicPayload = z.infer<
  typeof corporationBasicPayloadSchema
>;
export type CorporationInfoPayload = z.infer<
  typeof corporationInfoPayloadSchema
>;
