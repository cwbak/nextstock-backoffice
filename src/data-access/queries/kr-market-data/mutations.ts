import { apiRequest } from "@/data-access/api/client";
import {
  krMarketDataCreateAllPayloadSchema,
  krMarketDataCreatePayloadSchema,
  krMarketDataCreateResultSchema,
  type KrMarketDataCreateAllPayload,
  type KrMarketDataCreatePayload,
  type KrMarketDataCreateResult,
} from "@/data-access/schemas/kr-market-data";

export function createAllKrMarketData(
  payload: KrMarketDataCreateAllPayload,
): Promise<KrMarketDataCreateResult> {
  const body = krMarketDataCreateAllPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/kr-stocks/market-data",
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}

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
