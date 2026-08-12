import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  krStockSchema,
  krStockSyncResultSchema,
  krStockUpsertPayloadSchema,
  krStockUpdatePayloadSchema,
  type KrStock,
  type KrStockFormValues,
  type KrStockSyncResult,
  type KrStockUpsertPayload,
} from "@/data-access/schemas/kr-stock";

export function syncKrStocks(): Promise<KrStockSyncResult> {
  return apiRequest("/admin/kr-stocks/sync", krStockSyncResultSchema, {
    method: "POST",
  });
}

export async function upsertKrStock(
  payload: KrStockUpsertPayload,
): Promise<KrStock> {
  const parsedPayload = krStockUpsertPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/kr-stocks",
    krStockSchema,
    { method: "POST" },
    parsedPayload,
  );
}

export async function updateKrStock(
  payload: KrStockFormValues,
): Promise<KrStock> {
  const { code, ...updatePayload } = payload;
  const parsedPayload = krStockUpdatePayloadSchema.parse(updatePayload);

  return apiRequest(
    `/admin/kr-stocks/${encodeURIComponent(code)}`,
    krStockSchema,
    { method: "PUT" },
    parsedPayload,
  );
}

export async function deleteKrStock(code: string): Promise<void> {
  await apiRequestVoid(`/admin/kr-stocks/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
