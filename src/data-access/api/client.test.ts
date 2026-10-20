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
      "depth must be major, middle, or minor",
      "대분류, 중분류, 소분류 중 하나를 선택해 주세요.",
    ],
    [
      "major sector must not have a parent",
      "대분류에는 상위 섹터를 지정할 수 없습니다.",
    ],
    [
      "middle and minor sectors must have a parent",
      "중분류와 소분류에는 상위 섹터를 선택해 주세요.",
    ],
    [
      "parent depth must immediately precede sector depth",
      "중분류의 상위는 대분류, 소분류의 상위는 중분류여야 합니다.",
    ],
    [
      "depth cannot be changed while sector has children",
      "하위 섹터가 있어 분류를 변경할 수 없습니다.",
    ],
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
