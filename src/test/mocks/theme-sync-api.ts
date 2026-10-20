import { vi } from "vitest";

import type { KrStock } from "@/data-access/schemas/kr-stock";
import {
  themeCreatePayloadSchema,
  themeStockFormSchema,
  type Theme,
} from "@/data-access/schemas/theme";

export interface MockTheme {
  id: number;
  name: string;
  stocks: string[];
}

export function themeSyncStock(code: string): KrStock {
  return {
    code,
    corporationCode: "00126380",
    name: `종목 ${code}`,
    marketType: "KOSPI",
    stockType: "보통주",
    status: "ACTIVE",
    listDd: "2000-01-01",
    listShrs: null,
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
  };
}

function themeResponse(theme: MockTheme): Theme {
  return {
    id: theme.id,
    name: theme.name,
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requestBody(init: RequestInit | undefined): unknown {
  if (typeof init?.body !== "string")
    throw new Error("JSON 요청 본문이 필요합니다.");
  return JSON.parse(init.body) as unknown;
}

export function mockThemeSyncApi(
  initialThemes: MockTheme[],
  stockCodes: string[],
) {
  const themes = new Map(
    initialThemes.map((theme) => [
      theme.id,
      { ...theme, stocks: [...theme.stocks] },
    ]),
  );
  const stocks = new Map(
    stockCodes.map((code) => [code, themeSyncStock(code)]),
  );
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
      const respond = (body: unknown, status = 200) =>
        Promise.resolve(jsonResponse(body, status));
      if (control.fail?.(path, method))
        return respond({ error: "internal server error" }, 500);
      if (path === "/admin/stocks" && method === "GET")
        return respond([...stocks.values()]);
      if (path === "/admin/themes") {
        if (method === "GET")
          return respond([...themes.values()].map(themeResponse));
        if (method === "POST") {
          const payload = themeCreatePayloadSchema.parse(requestBody(init));
          if (
            themes.has(payload.id) ||
            [...themes.values()].some((theme) => theme.name === payload.name)
          )
            return respond({ error: "theme already exists" }, 409);
          const theme = { ...payload, stocks: [] };
          themes.set(theme.id, theme);
          return respond(themeResponse(theme), 201);
        }
      }
      const match =
        /^\/admin\/themes\/(\d+)(?:\/stocks(?:\/([A-Z0-9]{6}))?)?$/.exec(path);
      if (!match) throw new Error(`예상하지 못한 요청: ${method} ${path}`);
      const themeId = Number(match[1]);
      const theme = themes.get(themeId);
      if (!theme) return respond({ error: "theme not found" }, 404);
      if (!path.includes("/stocks") && method === "DELETE") {
        themes.delete(themeId);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (method === "GET")
        return respond(theme.stocks.map((code) => stocks.get(code)));
      if (method === "POST") {
        const { stockCode } = themeStockFormSchema.parse(requestBody(init));
        const stock = stocks.get(stockCode);
        if (!stock) return respond({ error: "stock not found" }, 404);
        if (theme.stocks.includes(stockCode))
          return respond({ error: "stock already exists in theme" }, 409);
        theme.stocks.push(stockCode);
        return respond(stock, 201);
      }
      const stockCode = match[2];
      if (
        method === "DELETE" &&
        stockCode &&
        theme.stocks.includes(stockCode)
      ) {
        theme.stocks = theme.stocks.filter((code) => code !== stockCode);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return respond({ error: "stock not found in theme" }, 404);
    });
  return {
    themes,
    stocks,
    control,
    fetchMock,
    snapshot: () =>
      [...themes.values()]
        .map((theme) => ({ ...theme, stocks: [...theme.stocks].sort() }))
        .sort((first, second) => first.id - second.id),
  };
}
