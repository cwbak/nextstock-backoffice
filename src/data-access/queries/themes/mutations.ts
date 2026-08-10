import { apiRequest } from "@/data-access/api/client";
import { krxStockSchema, type KrxStock } from "@/data-access/schemas/krx-stock";
import {
  themeCreatePayloadSchema,
  themeSchema,
  themeStockCreatePayloadSchema,
  type Theme,
  type ThemeCreatePayload,
  type ThemeStockCreatePayload,
} from "@/data-access/schemas/theme";

export async function createTheme(payload: ThemeCreatePayload): Promise<Theme> {
  const parsedPayload = themeCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/themes",
    themeSchema,
    { method: "POST" },
    parsedPayload,
  );
}

export async function createThemeStock(
  payload: ThemeStockCreatePayload,
): Promise<KrxStock> {
  const { themeId, ...body } = themeStockCreatePayloadSchema.parse(payload);

  return apiRequest(
    `/admin/themes/${encodeURIComponent(themeId)}/stocks`,
    krxStockSchema,
    { method: "POST" },
    body,
  );
}
