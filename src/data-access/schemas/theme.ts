import { z } from "zod";

import { krxStockCodeSchema } from "@/data-access/schemas/krx-stock";

export const themeIdSchema = z.number().int().positive();

export const themeSchema = z
  .object({
    id: themeIdSchema,
    parentThemeId: themeIdSchema.nullable(),
    name: z.string().min(1),
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const themeListSchema = z.array(themeSchema);

export const themeCreatePayloadSchema = z
  .object({
    id: themeIdSchema,
    parentThemeId: themeIdSchema.nullable(),
    name: z.string().trim().min(1, "테마명을 입력해 주세요."),
  })
  .strict()
  .refine(({ id, parentThemeId }) => parentThemeId !== id, {
    message: "상위 테마는 생성할 테마와 달라야 합니다.",
    path: ["parentThemeId"],
  });

export const themeStockFormSchema = z
  .object({
    stockCode: krxStockCodeSchema,
  })
  .strict();

export const themeStockCreatePayloadSchema = themeStockFormSchema.extend({
  themeId: themeIdSchema,
});
export type Theme = z.infer<typeof themeSchema>;
export type ThemeCreatePayload = z.infer<typeof themeCreatePayloadSchema>;
export type ThemeStockFormValues = z.infer<typeof themeStockFormSchema>;
export type ThemeStockCreatePayload = z.infer<
  typeof themeStockCreatePayloadSchema
>;
