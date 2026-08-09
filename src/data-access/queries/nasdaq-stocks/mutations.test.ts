import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadNasdaqStockCsv } from "@/data-access/queries/nasdaq-stocks/mutations";

describe("NASDAQ stock mutations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("CSV 파일을 multipart file 필드로 전송한다", async () => {
    const result = { processedCount: 2, upsertedCount: 1 };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const file = new File(["Symbol,Name\nA,Agilent"], "nasdaq.csv", {
      type: "text/csv",
    });

    await expect(uploadNasdaqStockCsv(file)).resolves.toEqual(result);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/admin/nasdaq-stocks");
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe("POST");
    expect(request?.headers).toBeInstanceOf(Headers);
    expect((request?.headers as Headers).has("Content-Type")).toBe(false);
    expect(request?.body).toBeInstanceOf(FormData);
    expect((request?.body as FormData).get("file")).toBe(file);
  });
});
