import { z } from "zod";

import { krStockCodeSchema } from "@/data-access/schemas/kr-stock";

const themeSyncIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "테마 ID는 양의 정수여야 합니다.")
  .refine(
    (value) => Number.isSafeInteger(Number(value)),
    "테마 ID가 지원 범위를 초과했습니다.",
  );

export const themeSyncInputSchema = z.object({
  fetched_at: z.iso.datetime({ offset: true }).optional(),
  source: z.string().trim().min(1).optional(),
  themes: z.record(
    themeSyncIdSchema,
    z.object({
      name: z.string().trim().min(1, "테마명을 입력해 주세요."),
      stocks: z.array(z.object({ stock_code: krStockCodeSchema })),
    }),
  ),
});

export type ThemeSyncInput = z.infer<typeof themeSyncInputSchema>;

export function parseThemeSyncJson(value: string): ThemeSyncInput {
  if (!value.trim()) {
    throw new Error("동기화할 JSON 내용을 입력해 주세요.");
  }
  let input: unknown;
  try {
    input = JSON.parse(value) as unknown;
  } catch {
    throw new Error(
      "JSON 형식이 올바르지 않습니다. 전체 파일 내용을 붙여 넣어 주세요.",
    );
  }
  const result = themeSyncInputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      result.error.issues
        .map((issue) => `${issue.path.join(".") || "JSON"}: ${issue.message}`)
        .join("\n"),
    );
  }
  return result.data;
}
