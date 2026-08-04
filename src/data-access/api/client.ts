import { z } from "zod";

import { env } from "@/lib/env";

const apiErrorResponseSchema = z.object({
  error: z.string(),
});

const serverErrorMessages: Readonly<Record<string, string>> = {
  "body code must match path code": "코드는 변경할 수 없습니다.",
  "business year must contain 4 digits": "사업연도는 숫자 4자리여야 합니다.",
  "corporation already exists": "이미 등록된 법인 코드입니다.",
  "corporation code must contain 8 digits":
    "법인 코드는 숫자 8자리여야 합니다.",
  "corporation has listed stocks":
    "연결된 상장 종목이 있어 법인을 삭제할 수 없습니다.",
  "corporation not found": "법인을 찾을 수 없습니다.",
  "dart corporation investments lookup failed":
    "DART 출자현황을 조회하지 못했습니다.",
  "dart corporation investments not found":
    "DART에서 해당 출자현황을 찾을 수 없습니다.",
  "industry code not found": "업종 분류 정보를 찾을 수 없습니다.",
  "internal server error": "서버 내부 오류가 발생했습니다.",
  "invalid dart corporation investments response":
    "DART 출자현황 응답 값이 올바르지 않습니다.",
  "listed stock already exists": "이미 등록된 종목 코드입니다.",
  "listed stock not found": "상장 종목을 찾을 수 없습니다.",
  "report code must be between 1 and 4": "보고서 구분을 선택해 주세요.",
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string) {
  const baseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl.slice(0, -1)
    : env.apiBaseUrl;

  return `${baseUrl}${path}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      "서버가 올바른 JSON을 반환하지 않았습니다.",
      response.status,
    );
  }
}

async function request(
  path: string,
  init: RequestInit,
  body?: unknown,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), requestInit);

  if (!response.ok) {
    const result = apiErrorResponseSchema.safeParse(
      await readResponseBody(response),
    );
    const message = result.success
      ? result.data.error
      : `요청에 실패했습니다. (${response.status})`;

    throw new ApiError(message, response.status);
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
  body?: unknown,
): Promise<T> {
  const response = await request(path, init, body);
  const result = schema.safeParse(await readResponseBody(response));

  if (!result.success) {
    throw new ApiError(
      "서버 응답 형식이 API 명세와 다릅니다.",
      response.status,
    );
  }

  return result.data;
}

export async function apiRequestVoid(
  path: string,
  init: RequestInit,
): Promise<void> {
  await request(path, init);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return serverErrorMessages[error.message] ?? error.message;
  }

  if (error instanceof TypeError) {
    return "API 서버에 연결할 수 없습니다. 서버 실행 상태를 확인해 주세요.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다.";
}
