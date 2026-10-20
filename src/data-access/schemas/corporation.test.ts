import { describe, expect, it } from "vitest";

import {
  corporationFormSchema,
  corporationSyncResultSchema,
  corporationUpsertFormSchema,
  corporationUpsertPayloadSchema,
} from "@/data-access/schemas/corporation";

describe("corporation schemas", () => {
  it("법인 코드 입력을 줄바꿈·쉼표·공백으로 나누고 순서와 앞자리 0을 보존한다", () => {
    expect(
      corporationUpsertFormSchema.parse({
        codes: " 00126380,\r\n00164779\t00401731 00126380, ",
      }),
    ).toEqual({
      codes: ["00126380", "00164779", "00401731", "00126380"],
    });
  });

  it.each(["", " , \r\n\t ", "00126380\n123", "00126380,abcdefgh"])(
    "비어 있거나 잘못된 코드 입력 %j를 거부한다",
    (codes) => {
      expect(corporationUpsertFormSchema.safeParse({ codes }).success).toBe(
        false,
      );
    },
  );

  it.each([
    {},
    { code: "00126380" },
    { codes: [] },
    { codes: "00126380" },
    { codes: [126380] },
    { codes: ["00126380", null] },
    { codes: ["00126380", "0016477"] },
  ])("잘못된 법인 코드 배열 요청 %j를 거부한다", (payload) => {
    expect(corporationUpsertPayloadSchema.safeParse(payload).success).toBe(
      false,
    );
  });

  it("법인 전체 동기화 결과를 검증한다", () => {
    const result = {
      fetchedCount: 2_850,
      updatedCount: 12,
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
