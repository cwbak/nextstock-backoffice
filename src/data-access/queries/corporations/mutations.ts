import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  buildCorporationInfo,
  corporationBasicPayloadSchema,
  corporationInfoPayloadSchema,
  corporationSchema,
  type Corporation,
  type CorporationFormValues,
} from "@/data-access/schemas/corporation";

export async function updateCorporation(
  payload: CorporationFormValues,
): Promise<Corporation> {
  const basicPayload = corporationBasicPayloadSchema.parse({
    name: payload.name,
    nameEn: payload.nameEn,
    ceoNm: payload.ceoNm,
    hmUrl: payload.hmUrl || null,
    address: payload.address,
    estDt: payload.estDt,
    accMt: payload.accMt,
    indutyCode: payload.indutyCode,
  });
  const infoPayload = corporationInfoPayloadSchema.parse({
    info: buildCorporationInfo(payload),
  });
  const path = `/admin/corporations/${encodeURIComponent(payload.code)}`;

  await apiRequest(
    path,
    corporationSchema,
    {
      method: "PUT",
    },
    basicPayload,
  );

  return apiRequest(
    `${path}/info`,
    corporationSchema,
    {
      method: "PUT",
    },
    infoPayload,
  );
}

export async function deleteCorporation(code: string): Promise<void> {
  await apiRequestVoid(`/admin/corporations/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
