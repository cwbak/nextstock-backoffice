import { apiRequest } from "@/data-access/api/client";
import {
  krStocksMarketDataAdjustJobRegistrationSchema,
  krStocksMarketDataStatisticsJobRegistrationSchema,
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
    "/admin/stock-prices/adjust",
    krStocksMarketDataAdjustJobRegistrationSchema,
    { method: "POST" },
  );
}

export function generateKrMarketDataStatistics(): Promise<BackgroundJobRegistration> {
  return apiRequest(
    "/admin/stock-prices/statistics",
    krStocksMarketDataStatisticsJobRegistrationSchema,
    { method: "POST" },
  );
}

export function adjustKrMarketData(
  payload: KrMarketDataAdjustPayload,
): Promise<KrMarketDataAdjustResult> {
  const { stockCode } = krMarketDataAdjustPayloadSchema.parse(payload);

  return apiRequest(
    `/admin/stock-prices/${encodeURIComponent(stockCode)}/adjust`,
    krMarketDataAdjustResultSchema,
    { method: "POST" },
  );
}

export function createKrxDailyMarketData(
  payload: KrMarketDataCreateAllPayload,
): Promise<KrMarketDataCreateResult> {
  const body = krMarketDataCreateAllPayloadSchema.parse(payload);

  return apiRequest(
    "/admin/stock-prices/krx-daily",
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
    "/admin/stock-prices/kis-daily",
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
    `/admin/stock-prices/${encodeURIComponent(stockCode)}`,
    krMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}
