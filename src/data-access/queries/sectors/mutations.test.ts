import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSector,
  updateSector,
  deleteSector,
  synchronizeSectors,
} from "@/data-access/queries/sectors/mutations";
import { mockSectorApi } from "@/test/mocks/sector-api";

function requestBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") throw new Error("JSON 요청 본문이 필요합니다.");
  return JSON.parse(body) as unknown;
}

describe("sector mutations", () => {
  afterEach(() => vi.restoreAllMocks());

  it("ID와 부모 ID를 JSON 숫자로 보내고 수정 본문에서는 ID를 제외한다", async () => {
    const api = mockSectorApi([
      { id: 10, name: "기술", depth: "major", parentId: null },
    ]);
    await expect(
      createSector({ id: 42, name: " 반도체 ", depth: "middle", parentId: 10 }),
    ).resolves.toEqual({
      id: 42,
      name: "반도체",
      depth: "middle",
      parentId: 10,
    });
    expect(requestBody(api.fetchMock.mock.calls[0]?.[1]?.body)).toEqual({
      id: 42,
      name: "반도체",
      depth: "middle",
      parentId: 10,
    });
    await expect(
      updateSector({ id: 42, name: "장비", depth: "major", parentId: null }),
    ).resolves.toEqual({
      id: 42,
      name: "장비",
      depth: "major",
      parentId: null,
    });
    expect(api.fetchMock.mock.calls[1]?.[0]).toBe("/admin/sectors/42");
    expect(api.fetchMock.mock.calls[1]?.[1]?.method).toBe("PUT");
    expect(requestBody(api.fetchMock.mock.calls[1]?.[1]?.body)).toEqual({
      name: "장비",
      depth: "major",
      parentId: null,
    });
    await expect(deleteSector(42)).resolves.toBeUndefined();
    expect(api.fetchMock.mock.calls[2]?.[0]).toBe("/admin/sectors/42");
    expect(api.fetchMock.mock.calls[2]?.[1]?.method).toBe("DELETE");
    expect(api.fetchMock.mock.calls[2]?.[1]?.body).toBeUndefined();
  });

  it.each([0, -1, 1.5, 2_147_483_648])(
    "허용 범위 밖의 ID %s는 전송하지 않는다",
    (id) => {
      const api = mockSectorApi([]);
      expect(() => deleteSector(id)).toThrow();
      expect(() =>
        createSector({ id, name: "기술", depth: "major", parentId: null }),
      ).toThrow();
      expect(() =>
        updateSector({ id, name: "기술", depth: "major", parentId: null }),
      ).toThrow();
      expect(api.fetchMock).not.toHaveBeenCalled();
    },
  );

  it("자기 자신을 부모로 하는 요청은 전송하지 않는다", () => {
    const api = mockSectorApi([]);
    expect(() =>
      updateSector({ id: 2, name: "반도체", depth: "middle", parentId: 2 }),
    ).toThrow();
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("동기화를 본문 없이 한 번 호출하고 결과를 반환한다", async () => {
    const api = mockSectorApi([
      { id: 10, name: "기술", depth: "major", parentId: null },
    ]);
    await expect(synchronizeSectors()).resolves.toEqual({
      created: 0,
      updated: 0,
      deleted: 0,
      unchanged: 1,
    });
    expect(api.fetchMock).toHaveBeenCalledTimes(1);
    expect(api.fetchMock.mock.calls[0]?.[0]).toBe("/admin/sectors/sync");
    expect(api.fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(api.fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined();
  });
});
