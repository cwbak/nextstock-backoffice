import { apiRequest } from "@/data-access/api/client";
import {
  krMarketDataCreatePayloadSchema,
  krMarketDataCreateResultSchema,
  type KrMarketDataCreatePayload,
  type KrMarketDataCreateResult,
} from "@/data-access/schemas/kr-market-data";

export function createKrMarketData(
  payload: KrMarketDataCreatePayload,
): Promise<KrMarketDataCreateResult> {
  const { stockCode, ...body } = krMarketDataCreatePayloadSchema.parse(payload);

  return apiRequest(
    `/admin/kr-stocks/${encodeURIComponent(stockCode)}/market-data`,
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}
