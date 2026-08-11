import { apiRequest } from "@/data-access/api/client";
import {
  usStockUploadResultSchema,
  type UsStockUploadResult,
} from "@/data-access/schemas/us-stock";

export async function uploadUsStockCsv(
  file: File,
): Promise<UsStockUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/admin/us-stocks", usStockUploadResultSchema, {
    method: "POST",
    body: formData,
  });
}
