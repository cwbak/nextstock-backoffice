import { z } from "zod";

export const sectorIdSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);

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

export const sectorUpdatePayloadSchema = sectorWritePayloadSchema
  .safeExtend({
    id: sectorIdSchema,
  })
  .refine(({ id, parentId }) => id !== parentId, {
    message: "자기 자신을 상위 섹터로 지정할 수 없습니다.",
    path: ["parentId"],
  });

export type Sector = z.infer<typeof sectorSchema>;
export type SectorDepth = z.infer<typeof sectorDepthSchema>;
export type SectorFormValues = z.infer<typeof sectorWritePayloadSchema>;
export type SectorUpdatePayload = z.infer<typeof sectorUpdatePayloadSchema>;
