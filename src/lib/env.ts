import { apiEnvSchema } from "@/lib/api-env";

const publicEnv = apiEnvSchema.parse({
  VITE_ADMIN_API_URL: import.meta.env.VITE_ADMIN_API_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

export const env = {
  adminApiUrl: publicEnv.VITE_ADMIN_API_URL,
  apiUrl: publicEnv.VITE_API_URL,
} as const;
