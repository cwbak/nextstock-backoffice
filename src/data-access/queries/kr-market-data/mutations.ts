import { apiRequest } from "@/data-access/api/client";
import {
  krStocksKisDailyJobRegistrationSchema,
  type BackgroundJobRegistration,
} from "@/data-access/schemas/background-job";
import {
  krMarketDataCreateAllPayloadSchema,
  krMarketDataCreatePayloadSchema,
  krMarketDataCreateResultSchema,
  type KrMarketDataCreateAllPayload,
  type KrMarketDataCreatePayload,
  type KrMarketDataCreateResult,
} from "@/data-access/schemas/kr-market-data";

export function createKrxDailyMarketData(
  payload: KrMarketDataCreateAllPayload,
): Promise<KrMarketDataCreateResult> {
  const body = krMarketDataCreateAllPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/kr-stocks/market-data/krx-daily",
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}

export function createKisDailyMarketData(
  payload: KrMarketDataCreateAllPayload,
): Promise<BackgroundJobRegistration> {
  const body = krMarketDataCreateAllPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/kr-stocks/market-data/kis-daily",
    krStocksKisDailyJobRegistrationSchema,
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
