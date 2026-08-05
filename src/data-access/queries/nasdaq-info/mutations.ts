import { apiRequest } from "@/data-access/api/client";
import {
  nasdaqInfoUploadResultSchema,
  type NasdaqInfoUploadResult,
} from "@/data-access/schemas/nasdaq-info";

export async function uploadNasdaqInfoCsv(
  file: File,
): Promise<NasdaqInfoUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/admin/nasdaq-info", nasdaqInfoUploadResultSchema, {
    method: "POST",
    body: formData,
  });
}
