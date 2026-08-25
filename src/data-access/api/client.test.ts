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
    [
      "limit must be between 1 and 200",
      "캔들 조회 개수는 1개 이상 200개 이하여야 합니다.",
    ],
  ])("새 stock 오류 메시지 %s를 번역한다", (serverMessage, expected) => {
    expect(getErrorMessage(new ApiError(serverMessage, 400))).toBe(expected);
  });
});
