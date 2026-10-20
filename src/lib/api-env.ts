import { z } from "zod";

const apiUrlSchema = z.url({
  protocol: /^https?$/,
  error: "http:// 또는 https://로 시작하는 API URL을 반드시 설정해 주세요.",
});

export const apiEnvSchema = z.object({
  VITE_ADMIN_API_URL: apiUrlSchema,
  VITE_API_URL: apiUrlSchema,
});
