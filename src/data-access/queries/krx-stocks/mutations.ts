import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  krxStockCreatePayloadSchema,
  krxStockSchema,
  krxStockUpdatePayloadSchema,
  type KrxStock,
  type KrxStockCreatePayload,
  type KrxStockFormValues,
} from "@/data-access/schemas/krx-stock";

export async function createKrxStock(
  payload: KrxStockCreatePayload,
): Promise<KrxStock> {
  const parsedPayload = krxStockCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/krx-stocks",
    krxStockSchema,
    { method: "POST" },
    parsedPayload,
  );
}

export async function updateKrxStock(
  payload: KrxStockFormValues,
): Promise<KrxStock> {
  const { code, ...updatePayload } = payload;
  const parsedPayload = krxStockUpdatePayloadSchema.parse(updatePayload);

  return apiRequest(
    `/admin/krx-stocks/${encodeURIComponent(code)}`,
    krxStockSchema,
    { method: "PUT" },
    parsedPayload,
  );
}

export async function deleteKrxStock(code: string): Promise<void> {
  await apiRequestVoid(`/admin/krx-stocks/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
