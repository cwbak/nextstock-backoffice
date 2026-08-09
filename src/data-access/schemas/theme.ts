import { z } from "zod";

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

export type Theme = z.infer<typeof themeSchema>;
