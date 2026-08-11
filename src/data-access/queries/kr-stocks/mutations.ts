import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  krStockCreatePayloadSchema,
  krStockSchema,
  krStockUpdatePayloadSchema,
  type KrStock,
  type KrStockCreatePayload,
  type KrStockFormValues,
} from "@/data-access/schemas/kr-stock";

export async function createKrStock(
  payload: KrStockCreatePayload,
): Promise<KrStock> {
  const parsedPayload = krStockCreatePayloadSchema.parse(payload);

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
