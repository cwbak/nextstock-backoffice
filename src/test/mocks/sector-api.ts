import { vi } from "vitest";

import {
  sectorWritePayloadSchema,
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
  let nextId = Math.max(0, ...initial.map((sector) => sector.id)) + 1;
  const control: { fail: ((path: string, method: string) => boolean) | null } =
    { fail: null };
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input, init) => {
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
      if (path === "/admin/sectors" && method === "GET")
        return reply([...sectors.values()]);
      const match = /^\/admin\/sectors\/(\d+)$/.exec(path);
      const id = match ? Number(match[1]) : null;
      if (id !== null && !sectors.has(id))
        return reply({ error: "sector not found" }, 404);
      if (method === "GET" && id !== null) return reply(sectors.get(id));
      if (method === "POST" || method === "PUT") {
        if (typeof init?.body !== "string")
          throw new Error("JSON 요청 본문이 필요합니다.");
        const payload = sectorWritePayloadSchema.parse(
          JSON.parse(init.body) as unknown,
        );
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
        const sector = { id: id ?? nextId++, ...payload };
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
