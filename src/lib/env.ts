import { z } from "zod";

const publicEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().or(z.literal("")).default(""),
});

const publicEnv = publicEnvSchema.parse(import.meta.env);

export const env = {
  apiBaseUrl: publicEnv.VITE_API_BASE_URL,
} as const;
