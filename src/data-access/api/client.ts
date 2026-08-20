import { z } from "zod";

import { env } from "@/lib/env";

const apiErrorResponseSchema = z.object({
  error: z.string(),
});

const serverErrorMessages: Readonly<Record<string, string>> = {
  "body code must match path code": "코드는 변경할 수 없습니다.",
  "background job not found": "백그라운드 작업을 찾을 수 없습니다.",
  "background jobs are unavailable":
    "백그라운드 작업 저장소가 구성되지 않았습니다.",
  "business year must contain 4 digits": "사업연도는 숫자 4자리여야 합니다.",
  "code must contain 8 digits": "법인 코드는 숫자 8자리여야 합니다.",
  "corporation code must contain 8 digits":
    "법인 코드는 숫자 8자리여야 합니다.",
  "corporation has KR stocks":
    "연결된 KR 종목이 있어 법인을 삭제할 수 없습니다.",
  "corporation is not listed on kospi or kosdaq":
    "KOSPI 또는 KOSDAQ 상장 법인이 아닙니다.",
  "corporation not found": "법인을 찾을 수 없습니다.",
  "code must contain 6 uppercase letters or digits":
    "종목 코드는 대문자 또는 숫자 6자리여야 합니다.",
  "dart corporation investments lookup failed":
    "DART 출자현황을 조회하지 못했습니다.",
  "dart corporation investments not found":
    "DART에서 해당 출자현황을 찾을 수 없습니다.",
  "dart corporation codes lookup failed":
    "DART 고유번호를 조회하지 못했습니다.",
  "dart company lookup failed": "DART 기업개황을 조회하지 못했습니다.",
  "dart company not found": "DART에서 해당 법인을 찾을 수 없습니다.",
  "end must use YYYY-MM-DD format":
    "조회 기준일은 YYYY-MM-DD 형식이어야 합니다.",
  "industry code not found": "업종 분류 정보를 찾을 수 없습니다.",
  "internal server error": "서버 내부 오류가 발생했습니다.",
  "from must not be after to": "종료일은 시작일보다 빠를 수 없습니다.",
  "from must use YYYY-MM-DD format": "시작일은 YYYY-MM-DD 형식이어야 합니다.",
  "invalid dart corporation investments response":
    "DART 출자현황 응답 값이 올바르지 않습니다.",
  "invalid dart corporation codes response":
    "DART 고유번호 응답 값이 올바르지 않습니다.",
  "invalid dart company response": "DART 기업개황 응답 값이 올바르지 않습니다.",
  "invalid kis response": "한국투자증권 종목 응답 값이 올바르지 않습니다.",
  "id must be a positive integer": "ID는 양의 정수여야 합니다.",
  "job id must be a positive integer": "작업 ID는 양의 정수여야 합니다.",
  "KR stock not found": "KR 종목을 찾을 수 없습니다.",
  "kr stock code does not match request":
    "요청한 종목 코드와 조회된 KR 종목 코드가 다릅니다.",
  "kr stock lookup failed": "KR 종목 정보를 조회하지 못했습니다.",
  "kr stock not found": "KR 종목을 찾을 수 없습니다.",
  "krx website market data lookup failed":
    "KRX 정보데이터시스템에서 전체 종목 일봉을 조회하지 못했습니다.",
  "krx stocks lookup failed": "KRX 전체 종목을 조회하지 못했습니다.",
  "invalid krx stocks response": "KRX 종목 응답 값이 올바르지 않습니다.",
  "korea investment market data lookup failed":
    "한국투자증권에서 KR 일봉을 조회하지 못했습니다.",
  "name is required": "이름을 입력해 주세요.",
  "limit must be between 1 and 1000":
    "캔들 조회 개수는 1개 이상 1,000개 이하여야 합니다.",
  "parent theme id must be a positive integer":
    "상위 테마 ID는 양의 정수여야 합니다.",
  "parent theme id must differ from id":
    "상위 테마는 생성할 테마와 달라야 합니다.",
  "parent theme not found": "상위 테마를 찾을 수 없습니다.",
  "period must be daily, weekly, or monthly":
    "캔들 주기는 일봉, 주봉, 월봉 중에서 선택해 주세요.",
  "report code must be between 1 and 4": "보고서 구분을 선택해 주세요.",
  "theme id must be a positive integer": "테마 ID는 양의 정수여야 합니다.",
  "stock already exists in theme": "이미 이 테마에 포함된 종목입니다.",
  "stock code must contain 6 uppercase letters or digits":
    "종목 코드는 대문자 또는 숫자 6자리여야 합니다.",
  "status is required": "종목 상태를 선택해 주세요.",
  "status must be ACTIVE, LISTING_SCHEDULED, DELISTED, or SUSPENDED":
    "종목 상태가 유효하지 않습니다.",
  "theme already exists": "같은 ID 또는 이름의 테마가 이미 있습니다.",
  "theme not found": "테마를 찾을 수 없습니다.",
  "to must use YYYY-MM-DD format": "종료일은 YYYY-MM-DD 형식이어야 합니다.",
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
