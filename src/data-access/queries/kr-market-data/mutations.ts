import { apiRequest } from "@/data-access/api/client";
import {
  krStocksMarketDataAdjustJobRegistrationSchema,
  krStocksKisDailyJobRegistrationSchema,
  type BackgroundJobRegistration,
} from "@/data-access/schemas/background-job";
import {
  krMarketDataAdjustPayloadSchema,
  krMarketDataAdjustResultSchema,
  krMarketDataCreateAllPayloadSchema,
  krMarketDataCreatePayloadSchema,
  krMarketDataCreateResultSchema,
  krMarketDataKisDailyPayloadSchema,
  type KrMarketDataCreateAllPayload,
  type KrMarketDataCreatePayload,
  type KrMarketDataCreateResult,
  type KrMarketDataAdjustPayload,
  type KrMarketDataAdjustResult,
  type KrMarketDataKisDailyPayload,
} from "@/data-access/schemas/kr-market-data";

export function adjustAllKrMarketData(): Promise<BackgroundJobRegistration> {
  return apiRequest(
    "/admin/stocks/market-data/adjust",
    krStocksMarketDataAdjustJobRegistrationSchema,
    { method: "POST" },
  );
}

export function adjustKrMarketData(
  payload: KrMarketDataAdjustPayload,
): Promise<KrMarketDataAdjustResult> {
  const { stockCode } = krMarketDataAdjustPayloadSchema.parse(payload);

  return apiRequest(
    `/admin/stocks/${encodeURIComponent(stockCode)}/market-data/adjust`,
    krMarketDataAdjustResultSchema,
    { method: "POST" },
  );
}

export function createKrxDailyMarketData(
  payload: KrMarketDataCreateAllPayload,
): Promise<KrMarketDataCreateResult> {
  const body = krMarketDataCreateAllPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/stocks/market-data/krx-daily",
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}

export function createKisDailyMarketData(
  payload: KrMarketDataKisDailyPayload,
): Promise<BackgroundJobRegistration> {
  const body = krMarketDataKisDailyPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/stocks/market-data/kis-daily",
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
    `/admin/stocks/${encodeURIComponent(stockCode)}/market-data`,
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}
