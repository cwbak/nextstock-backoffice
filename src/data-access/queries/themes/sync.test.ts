import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  prepareThemeSync,
  synchronizeThemes,
  ThemeSyncPreflightError,
} from "@/data-access/queries/themes/sync";
import { getThemeSyncChangeCount } from "@/data-access/queries/themes/sync-plan";
import { parseThemeSyncJson } from "@/data-access/schemas/theme-sync";
import { mockThemeSyncApi } from "@/test/mocks/theme-sync-api";

const input = parseThemeSyncJson(
  JSON.stringify({
    themes: {
      "210": {
        name: "JSON의 이름은 기존 이름을 덮어쓰지 않는다",
        stocks: [
          { stock_code: "065450" },
          { stock_code: "024950" },
          { stock_code: "024950", name: "중복 연결" },
        ],
      },
      "124": { name: "제대혈", stocks: [{ stock_code: "006280" }] },
    },
  }),
);

function createApi() {
  return mockThemeSyncApi(
    [
      { id: 210, name: "자전거", stocks: ["065450", "123750"] },
      { id: 284, name: "SPAC", stocks: ["123750"] },
    ],
    ["065450", "024950", "123750", "006280"],
  );
}

function writes(api: ReturnType<typeof createApi>) {
  return api.fetchMock.mock.calls.filter(
    ([, init]) => init?.method && init.method !== "GET",
  );
}

describe("theme synchronization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("추가·삭제·연쇄 삭제를 계산하고 중복 종목은 한 연결로 처리한다", async () => {
    const api = createApi();
    const plan = await prepareThemeSync(input, new QueryClient());
    expect(plan.themesToCreate).toEqual([{ id: 124, name: "제대혈" }]);
    expect(plan.themesToDelete.map((theme) => theme.id)).toEqual([284]);
    expect(plan.stocksToAdd).toEqual([
      { themeId: 124, stockCode: "006280" },
      { themeId: 210, stockCode: "024950" },
    ]);
    expect(plan.stocksToDelete).toEqual([
      { themeId: 210, stockCode: "123750" },
    ]);
    expect(plan.cascadedStockCount).toBe(1);
    expect(plan.stockLinkCount).toBe(3);
    expect(writes(api)).toHaveLength(0);
  });

  it("JSON과 테마·연결을 완전히 일치시키고 기존 이름과 종목은 유지한다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    await expect(
      synchronizeThemes(plan, queryClient, vi.fn()),
    ).resolves.toEqual({
      themesCreated: 1,
      themesDeleted: 1,
      stocksAdded: 2,
      stocksDeleted: 2,
      themeCount: 2,
      stockLinkCount: 3,
    });
    expect(api.snapshot()).toEqual([
      { id: 124, name: "제대혈", stocks: ["006280"] },
      { id: 210, name: "자전거", stocks: ["024950", "065450"] },
    ]);
    expect(api.stocks.size).toBe(4);
    expect(
      getThemeSyncChangeCount(await prepareThemeSync(input, queryClient)),
    ).toBe(0);
  });

  it("미등록 코드를 테마별로 모아 리포트하고 삭제를 포함한 모든 변경을 막는다", async () => {
    const api = createApi();
    api.stocks.delete("006280");
    api.stocks.delete("024950");
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    expect(plan.missingStocks).toEqual([
      { stockCode: "006280", themeIds: [124] },
      { stockCode: "024950", themeIds: [210] },
    ]);
    await expect(
      synchronizeThemes(plan, queryClient, vi.fn()),
    ).rejects.toBeInstanceOf(ThemeSyncPreflightError);
    expect(writes(api)).toHaveLength(0);
    expect(api.themes.has(284)).toBe(true);
  });

  it("검사 후 종목이 삭제되면 실행 직전 재검사에서 중단한다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    api.stocks.delete("006280");
    await expect(
      synchronizeThemes(plan, queryClient, vi.fn()),
    ).rejects.toBeInstanceOf(ThemeSyncPreflightError);
    expect(writes(api)).toHaveLength(0);
  });

  it("검사 후 DB가 바뀌면 오래된 변경 내역을 실행하지 않는다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    api.themes.set(999, { id: 999, name: "다른 관리자의 테마", stocks: [] });
    await expect(synchronizeThemes(plan, queryClient, vi.fn())).rejects.toThrow(
      "검사 후 테마 또는 종목 연결이 변경되었습니다",
    );
    expect(writes(api)).toHaveLength(0);
  });

  it("유지할 테마와 새 테마의 이름이 충돌하면 변경 전에 중단한다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const conflictInput = parseThemeSyncJson(
      '{"themes":{"210":{"name":"무시","stocks":[]},"124":{"name":"자전거","stocks":[]}}}',
    );
    const plan = await prepareThemeSync(conflictInput, queryClient);
    expect(plan.nameConflicts).toEqual([
      { name: "자전거", themeIds: [124, 210] },
    ]);
    await expect(
      synchronizeThemes(plan, queryClient, vi.fn()),
    ).rejects.toBeInstanceOf(ThemeSyncPreflightError);
    expect(writes(api)).toHaveLength(0);
  });

  it("삭제할 테마의 이름은 새 ID에서 재사용할 수 있다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const replacement = parseThemeSyncJson(
      '{"themes":{"999":{"name":"자전거","stocks":[]}}}',
    );
    await synchronizeThemes(
      await prepareThemeSync(replacement, queryClient),
      queryClient,
      vi.fn(),
    );
    expect(api.snapshot()).toEqual([{ id: 999, name: "자전거", stocks: [] }]);
  });

  it("도중 실패 시 중단하고 다시 검사하면 남은 작업만 반영한다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    api.control.fail = (path, method) =>
      path === "/admin/themes/210/stocks" && method === "POST";
    await expect(synchronizeThemes(plan, queryClient, vi.fn())).rejects.toThrow(
      "일부 변경이 반영되었을 수 있으니 다시 사전 검사",
    );
    api.control.fail = null;
    const remaining = await prepareThemeSync(input, queryClient);
    expect(remaining.themesToCreate).toHaveLength(0);
    expect(remaining.themesToDelete).toHaveLength(0);
    await synchronizeThemes(remaining, queryClient, vi.fn());
    expect(api.snapshot()).toEqual([
      { id: 124, name: "제대혈", stocks: ["006280"] },
      { id: 210, name: "자전거", stocks: ["024950", "065450"] },
    ]);
  });

  it("최종 검증을 읽지 못하면 성공으로 보고하지 않는다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const plan = await prepareThemeSync(input, queryClient);
    const onProgress = vi.fn((progress: { stage: string }) => {
      if (progress.stage === "verifying")
        api.control.fail = (path) => path === "/admin/themes";
    });
    await expect(
      synchronizeThemes(plan, queryClient, onProgress),
    ).rejects.toThrow("최종 검증에 실패했습니다");
  });

  it("명시적인 빈 themes는 테마와 연결만 전체 삭제한다", async () => {
    const api = createApi();
    const queryClient = new QueryClient();
    const empty = parseThemeSyncJson('{"themes":{}}');
    await synchronizeThemes(
      await prepareThemeSync(empty, queryClient),
      queryClient,
      vi.fn(),
    );
    expect(api.snapshot()).toEqual([]);
    expect(api.stocks.size).toBe(4);
  });
});
