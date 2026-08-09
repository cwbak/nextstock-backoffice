import { apiRequest } from "@/data-access/api/client";
import {
  nasdaqStockUploadResultSchema,
  type NasdaqStockUploadResult,
} from "@/data-access/schemas/nasdaq-stock";

export async function uploadNasdaqStockCsv(
  file: File,
): Promise<NasdaqStockUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/admin/nasdaq-stocks", nasdaqStockUploadResultSchema, {
    method: "POST",
    body: formData,
  });
}
