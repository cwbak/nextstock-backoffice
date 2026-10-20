import { z } from "zod";

const sectorIdError = "섹터 ID는 1~2,147,483,647 사이의 정수여야 합니다.";

export const sectorIdSchema = z
  .number({ error: sectorIdError })
  .int(sectorIdError)
  .min(1, sectorIdError)
  .max(2_147_483_647, sectorIdError);

export const sectorDepthSchema = z.enum(["major", "middle", "minor"], {
  error: "대분류, 중분류, 소분류 중 하나를 선택해 주세요.",
});

export const sectorSchema = z
  .object({
    id: sectorIdSchema,
    name: z.string().min(1),
    depth: sectorDepthSchema,
    parentId: sectorIdSchema.nullable(),
  })
  .strict();

export const sectorListSchema = z.array(sectorSchema);

export const sectorWritePayloadSchema = z
  .object({
    name: z.string().trim().min(1, "섹터명을 입력해 주세요."),
    depth: sectorDepthSchema,
    parentId: sectorIdSchema.nullable(),
  })
  .strict()
  .refine(({ depth, parentId }) => depth !== "major" || parentId === null, {
    message: "대분류에는 상위 섹터를 지정할 수 없습니다.",
    path: ["parentId"],
  })
  .refine(({ depth, parentId }) => depth === "major" || parentId !== null, {
    message: "중분류와 소분류에는 상위 섹터를 선택해 주세요.",
    path: ["parentId"],
  });

export const sectorCreatePayloadSchema = sectorWritePayloadSchema
  .safeExtend({
    id: sectorIdSchema,
  })
  .refine(({ id, parentId }) => id !== parentId, {
    message: "자기 자신을 상위 섹터로 지정할 수 없습니다.",
    path: ["parentId"],
  });

export const sectorUpdatePayloadSchema = sectorCreatePayloadSchema;

export const sectorSyncResultSchema = z
  .object({
    created: z.number().int().nonnegative(),
    updated: z.number().int().nonnegative(),
    deleted: z.number().int().nonnegative(),
    unchanged: z.number().int().nonnegative(),
  })
  .strict();

export type Sector = z.infer<typeof sectorSchema>;
export type SectorDepth = z.infer<typeof sectorDepthSchema>;
export type SectorFormValues = z.infer<typeof sectorCreatePayloadSchema>;
export type SectorUpdatePayload = z.infer<typeof sectorUpdatePayloadSchema>;
export type SectorSyncResult = z.infer<typeof sectorSyncResultSchema>;
