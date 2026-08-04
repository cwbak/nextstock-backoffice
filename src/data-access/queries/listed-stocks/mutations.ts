import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  listedStockCreatePayloadSchema,
  listedStockSchema,
  listedStockUpdatePayloadSchema,
  type ListedStock,
  type ListedStockCreatePayload,
  type ListedStockFormValues,
} from "@/data-access/schemas/listed-stock";

export async function createListedStock(
  payload: ListedStockCreatePayload,
): Promise<ListedStock> {
  const parsedPayload = listedStockCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/listed-stocks",
    listedStockSchema,
    { method: "POST" },
    parsedPayload,
  );
}

export async function updateListedStock(
  payload: ListedStockFormValues,
): Promise<ListedStock> {
  const { code, ...updatePayload } = payload;
  const parsedPayload = listedStockUpdatePayloadSchema.parse(updatePayload);

  return apiRequest(
    `/admin/listed-stocks/${encodeURIComponent(code)}`,
    listedStockSchema,
    { method: "PUT" },
    parsedPayload,
  );
}

export async function deleteListedStock(code: string): Promise<void> {
  await apiRequestVoid(`/admin/listed-stocks/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
