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

  return apiRequest("/admin/nasdaqs", nasdaqInfoUploadResultSchema, {
    method: "POST",
    body: formData,
  });
}
