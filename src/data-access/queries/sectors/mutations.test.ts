import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSector,
  updateSector,
  deleteSector,
} from "@/data-access/queries/sectors/mutations";
import { mockSectorApi } from "@/test/mocks/sector-api";

describe("sector mutations", () => {
  afterEach(() => vi.restoreAllMocks());

  it("분류를 포함해 생성하고, 대분류 수정 시 null 부모를 전송하며, 본문 없이 삭제한다", async () => {
    const api = mockSectorApi([
      { id: 1, name: "기술", depth: "major", parentId: null },
    ]);
    await expect(
      createSector({ name: " 반도체 ", depth: "middle", parentId: 1 }),
    ).resolves.toEqual({ id: 2, name: "반도체", depth: "middle", parentId: 1 });
    expect(api.fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ name: "반도체", depth: "middle", parentId: 1 }),
    );
    await expect(
      updateSector({ id: 2, name: "장비", depth: "major", parentId: null }),
    ).resolves.toEqual({ id: 2, name: "장비", depth: "major", parentId: null });
    expect(api.fetchMock.mock.calls[1]?.[0]).toBe("/admin/sectors/2");
    expect(api.fetchMock.mock.calls[1]?.[1]?.method).toBe("PUT");
    expect(api.fetchMock.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ name: "장비", depth: "major", parentId: null }),
    );
    await expect(deleteSector(2)).resolves.toBeUndefined();
    expect(api.fetchMock.mock.calls[2]?.[1]?.method).toBe("DELETE");
    expect(api.fetchMock.mock.calls[2]?.[1]?.body).toBeUndefined();
  });

  it("잘못된 ID와 자기 자신을 부모로 하는 요청은 전송하지 않는다", () => {
    const api = mockSectorApi([]);
    expect(() => deleteSector(0)).toThrow();
    expect(() =>
      updateSector({ id: 2, name: "반도체", depth: "middle", parentId: 2 }),
    ).toThrow();
    expect(api.fetchMock).not.toHaveBeenCalled();
  });
});
