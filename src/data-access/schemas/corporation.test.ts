import { describe, expect, it } from "vitest";

import {
  corporationFormSchema,
  corporationSyncResultSchema,
} from "@/data-access/schemas/corporation";

describe("corporation schemas", () => {
  it("법인 전체 동기화 결과를 검증한다", () => {
    const result = {
      corporationFetchedCount: 2_850,
      corporationUpdatedCount: 12,
    };

    expect(corporationSyncResultSchema.parse(result)).toEqual(result);
  });

  it("API 명세에 따라 빈 영문 법인명을 허용한다", () => {
    expect(
      corporationFormSchema.parse({
        accMt: 12,
        address: "경기도 수원시 영통구 삼성로 129",
        ceoNm: "한종희",
        code: "00126380",
        estDt: "1969-01-13",
        hmUrl: "",
        indutyCode: "264",
        name: "삼성전자",
        nameEn: "",
        products: "",
        summary: "",
      }).nameEn,
    ).toBe("");
  });
});
