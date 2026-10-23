import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { apiEnvSchema } from "./src/lib/api-env";

export default defineConfig(({ mode }) => {
  apiEnvSchema.parse(loadEnv(mode, process.cwd(), "VITE_"));

  return {
    server: {
      host: "127.0.0.1",
      port: 3081,
      strictPort: true,
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
