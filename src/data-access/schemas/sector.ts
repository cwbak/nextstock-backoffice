import { z } from "zod";

export const sectorIdSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);

export const sectorSchema = z
  .object({
    id: sectorIdSchema,
    name: z.string().min(1),
    parentId: sectorIdSchema.nullable(),
  })
  .strict();

export const sectorListSchema = z.array(sectorSchema);

export const sectorWritePayloadSchema = z
  .object({
    name: z.string().trim().min(1, "섹터명을 입력해 주세요."),
    parentId: sectorIdSchema.nullable(),
  })
  .strict();

export const sectorUpdatePayloadSchema = sectorWritePayloadSchema
  .extend({
    id: sectorIdSchema,
  })
  .refine(({ id, parentId }) => id !== parentId, {
    message: "자기 자신을 상위 섹터로 지정할 수 없습니다.",
    path: ["parentId"],
  });

export type Sector = z.infer<typeof sectorSchema>;
export type SectorFormValues = z.infer<typeof sectorWritePayloadSchema>;
export type SectorUpdatePayload = z.infer<typeof sectorUpdatePayloadSchema>;
