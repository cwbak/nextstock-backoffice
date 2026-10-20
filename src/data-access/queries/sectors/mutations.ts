import { apiRequest, apiRequestVoid } from "@/data-access/api/client";
import {
  sectorIdSchema,
  sectorSchema,
  sectorUpdatePayloadSchema,
  sectorCreatePayloadSchema,
  sectorSyncResultSchema,
  type SectorFormValues,
  type SectorUpdatePayload,
} from "@/data-access/schemas/sector";

export function createSector(payload: SectorFormValues) {
  const body = sectorCreatePayloadSchema.parse(payload);
  return apiRequest("/admin/sectors", sectorSchema, { method: "POST" }, body);
}

export function updateSector(payload: SectorUpdatePayload) {
  const { id, ...body } = sectorUpdatePayloadSchema.parse(payload);
  return apiRequest(
    `/admin/sectors/${id}`,
    sectorSchema,
    { method: "PUT" },
    body,
  );
}

export function deleteSector(id: number) {
  return apiRequestVoid(`/admin/sectors/${sectorIdSchema.parse(id)}`, {
    method: "DELETE",
  });
}

export function synchronizeSectors() {
  return apiRequest("/admin/sectors/sync", sectorSyncResultSchema, {
    method: "POST",
  });
}
