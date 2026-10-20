import { describe, expect, it } from "vitest";

import { apiEnvSchema } from "@/lib/api-env";

describe("API environment", () => {
  it("관리자와 사용자 API 주소를 분리하고 허용한 공개 설정만 반환한다", () => {
    expect(
      apiEnvSchema.parse({
        VITE_ADMIN_API_URL: "http://127.0.0.1:8081",
        VITE_API_URL: "http://127.0.0.1:8080",
        PRIVATE_TOKEN: "not-exported",
      }),
    ).toEqual({
      VITE_ADMIN_API_URL: "http://127.0.0.1:8081",
      VITE_API_URL: "http://127.0.0.1:8080",
    });
  });

  it.each(["VITE_ADMIN_API_URL", "VITE_API_URL"])(
    "필수 %s 주소가 누락되거나 HTTP 절대 URL이 아니면 거부한다",
    (key) => {
      for (const value of [
        undefined,
        "",
        "/api",
        "not-a-url",
        "ftp://example.com",
      ]) {
        const result = apiEnvSchema.safeParse({
          VITE_ADMIN_API_URL: "http://127.0.0.1:8081",
          VITE_API_URL: "http://127.0.0.1:8080",
          [key]: value,
        });
        expect(result.success).toBe(false);
        if (!result.success)
          expect(result.error.issues[0]?.path).toEqual([key]);
      }
    },
  );
});
