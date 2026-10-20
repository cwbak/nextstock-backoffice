import { describe, expect, it } from "vitest";

import { parseThemeSyncJson } from "@/data-access/schemas/theme-sync";

describe("parseThemeSyncJson", () => {
  it("종목 코드의 앞자리 0을 유지하고 종목명은 무시한다", () => {
    expect(
      parseThemeSyncJson(
        JSON.stringify({
          fetched_at: "2026-10-20T17:38:15+09:00",
          source: "NAVER",
          themes: {
            "210": {
              name: " 자전거 ",
              stocks: [{ stock_code: "065450", name: "사용하지 않는 이름" }],
            },
          },
        }),
      ),
    ).toEqual({
      fetched_at: "2026-10-20T17:38:15+09:00",
      source: "NAVER",
      themes: { "210": { name: "자전거", stocks: [{ stock_code: "065450" }] } },
    });
  });

  it.each([
    "",
    "{",
    '{"themes":',
    '{"themes":null}',
    '{"themes":{"210":{"name":"자전거"}}}',
    '{"themes":{"210":{"name":"자전거","stocks":[{"stock_code":65450}]}}}',
    '{"themes":{"0":{"name":"테마","stocks":[]}}}',
    '{"themes":{"9007199254740992":{"name":"테마","stocks":[]}}}',
  ])("불완전하거나 유효하지 않은 JSON을 거부한다: %s", (json) => {
    expect(() => parseThemeSyncJson(json)).toThrow();
  });

  it("명시적인 빈 themes와 종목 목록은 허용한다", () => {
    expect(parseThemeSyncJson('{"themes":{}}')).toEqual({ themes: {} });
    expect(
      parseThemeSyncJson('{"themes":{"210":{"name":"자전거","stocks":[]}}}')
        .themes["210"]?.stocks,
    ).toEqual([]);
  });
});
