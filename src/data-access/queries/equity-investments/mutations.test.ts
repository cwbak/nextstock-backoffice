import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAllEquityInvestments,
  createEquityInvestments,
} from "@/data-access/queries/equity-investments/mutations";

const createResult = {
  corpCode: "00126380",
  bsnsYear: "2025",
  reprtCode: 4,
  fetchedCount: 12,
  upsertedCount: 10,
} as const;

const bulkCreateRegistration = {
  jobId: 43,
  type: "equity_investments_all",
  status: "QUEUED",
  statusUrl: "/admin/jobs/43",
  created: true,
  createdAt: "2026-08-13T11:00:00+09:00",
} as const;

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") {
    throw new TypeError("요청 본문이 JSON 문자열이 아닙니다.");
  }

  return JSON.parse(body) as unknown;
}

describe("equity investment mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("DART 조회 조건으로 지분투자 DRAFT 생성을 요청한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(createResult), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    await expect(
      createEquityInvestments({
        corpCode: "00126380",
        bsnsYear: "2025",
        reprtCode: 4,
      }),
    ).resolves.toEqual(createResult);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/equity_investments");

    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      corpCode: "00126380",
      bsnsYear: "2025",
      reprtCode: 4,
    });
  });

  it("전체 법인 DRAFT 생성에는 사업연도와 보고서만 전송한다", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(bulkCreateRegistration), {
        headers: { "Content-Type": "application/json" },
        status: 202,
      }),
    );

    await expect(
      createAllEquityInvestments({
        bsnsYear: "2025",
        reprtCode: 4,
      }),
    ).resolves.toEqual(bulkCreateRegistration);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/equity_investments/all");

    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe("POST");
    expect(parseRequestBody(request?.body)).toEqual({
      bsnsYear: "2025",
      reprtCode: 4,
    });
  });
});
