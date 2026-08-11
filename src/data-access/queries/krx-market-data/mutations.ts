import { apiRequest } from "@/data-access/api/client";
import {
  krxMarketDataCreatePayloadSchema,
  krxMarketDataCreateResultSchema,
  type KrxMarketDataCreatePayload,
  type KrxMarketDataCreateResult,
} from "@/data-access/schemas/krx-market-data";

export function createKrxMarketData(
  payload: KrxMarketDataCreatePayload,
): Promise<KrxMarketDataCreateResult> {
  const { stockCode, ...body } =
    krxMarketDataCreatePayloadSchema.parse(payload);

  return apiRequest(
    `/admin/krx-stocks/${encodeURIComponent(stockCode)}/market-data`,
    krxMarketDataCreateResultSchema,
    { method: "POST" },
    body,
  );
}
