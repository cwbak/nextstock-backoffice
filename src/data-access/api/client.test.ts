import { describe, expect, it } from "vitest";

import { ApiError, getErrorMessage } from "@/data-access/api/client";

describe("getErrorMessage", () => {
  it.each([
    [
      "corporation has stocks",
      "연결된 KR 종목이 있어 법인을 삭제할 수 없습니다.",
    ],
    ["stock lookup failed", "KR 종목 정보를 조회하지 못했습니다."],
    ["stock not found", "KR 종목을 찾을 수 없습니다."],
    ["sector not found", "섹터를 찾을 수 없습니다."],
    ["parent sector not found", "상위 섹터를 찾을 수 없습니다."],
    [
      "sector hierarchy would form a cycle",
      "하위 섹터를 상위로 지정할 수 없습니다. 다른 상위 섹터를 선택해 주세요.",
    ],
    [
      "krx website stock prices lookup failed",
      "KRX 정보데이터시스템에서 전체 종목 일봉을 조회하지 못했습니다.",
    ],
    [
      "korea investment stock prices lookup failed",
      "한국투자증권에서 KR 일봉을 조회하지 못했습니다.",
    ],
    [
      "limit must be between 1 and 200",
      "캔들 조회 개수는 1개 이상 200개 이하여야 합니다.",
    ],
  ])("새 stock 오류 메시지 %s를 번역한다", (serverMessage, expected) => {
    expect(getErrorMessage(new ApiError(serverMessage, 400))).toBe(expected);
  });
});
