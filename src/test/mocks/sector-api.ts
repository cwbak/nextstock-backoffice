import { vi } from "vitest";

import {
  sectorWritePayloadSchema,
  sectorCreatePayloadSchema,
  type Sector,
} from "@/data-access/schemas/sector";

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mockSectorApi(initial: ReadonlyArray<Sector>) {
  const sectors = new Map(initial.map((sector) => [sector.id, { ...sector }]));
  const control: {
    fail: ((path: string, method: string) => boolean) | null;
    syncSectors: ReadonlyArray<Sector> | null;
    syncError: string | null;
    syncGate: Promise<void> | null;
  } = { fail: null, syncSectors: null, syncError: null, syncGate: null };
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const path =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url;
      const method = init?.method ?? "GET";
      const reply = (value: unknown, status = 200) =>
        Promise.resolve(jsonResponse(value, status));
      if (control.fail?.(path, method))
        return reply({ error: "internal server error" }, 500);
      if (path === "/admin/sectors/sync" && method === "POST") {
        if (control.syncGate) await control.syncGate;
        if (control.syncError) return reply({ error: control.syncError }, 502);
        const listings = control.syncSectors ?? [...sectors.values()];
        const result = { created: 0, updated: 0, deleted: 0, unchanged: 0 };
        for (const listing of listings) {
          const current = sectors.get(listing.id);
          if (!current) result.created++;
          else if (
            current.name !== listing.name ||
            current.depth !== listing.depth ||
            current.parentId !== listing.parentId
          )
            result.updated++;
          else result.unchanged++;
        }
        result.deleted = [...sectors.keys()].filter(
          (id) => !listings.some((sector) => sector.id === id),
        ).length;
        sectors.clear();
        for (const sector of listings) sectors.set(sector.id, { ...sector });
        return reply(result);
      }
      if (path === "/admin/sectors" && method === "GET")
        return reply([...sectors.values()]);
      const match = /^\/admin\/sectors\/([^/]+)$/.exec(path);
      const id = match ? Number(match[1]) : null;
      if (id !== null && !sectors.has(id))
        return reply({ error: "sector not found" }, 404);
      if (method === "GET" && id !== null) return reply(sectors.get(id));
      if (method === "POST" || method === "PUT") {
        if (typeof init?.body !== "string")
          throw new Error("JSON 요청 본문이 필요합니다.");
        const raw: unknown = JSON.parse(init.body);
        const payload =
          method === "POST"
            ? sectorCreatePayloadSchema.parse(raw)
            : { ...sectorWritePayloadSchema.parse(raw), id: id ?? 0 };
        if (method === "POST" && sectors.has(payload.id))
          return reply({ error: "sector id already exists" }, 409);
        if (payload.parentId !== null && !sectors.has(payload.parentId))
          return reply({ error: "parent sector not found" }, 404);
        const parent =
          payload.parentId === null ? undefined : sectors.get(payload.parentId);
        if (
          parent &&
          !(
            (payload.depth === "middle" && parent.depth === "major") ||
            (payload.depth === "minor" && parent.depth === "middle")
          )
        )
          return reply(
            { error: "parent depth must immediately precede sector depth" },
            400,
          );
        if (
          id !== null &&
          sectors.get(id)?.depth !== payload.depth &&
          [...sectors.values()].some((sector) => sector.parentId === id)
        ) {
          return reply(
            { error: "depth cannot be changed while sector has children" },
            400,
          );
        }
        const sector = payload;
        sectors.set(sector.id, sector);
        return reply(sector, method === "POST" ? 201 : 200);
      }
      if (method === "DELETE" && id !== null) {
        const deleted = new Set([id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const sector of sectors.values()) {
            if (
              sector.parentId !== null &&
              deleted.has(sector.parentId) &&
              !deleted.has(sector.id)
            ) {
              deleted.add(sector.id);
              changed = true;
            }
          }
        }
        for (const deletedId of deleted) sectors.delete(deletedId);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      throw new Error(`예상하지 못한 요청: ${method} ${path}`);
    });
  return { sectors, control, fetchMock };
}
