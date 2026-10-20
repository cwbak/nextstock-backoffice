import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// 도메인 테스트의 fetch mock은 경로만 비교한다. 실제 서버 주소 분리는
// client-routing.test.ts에서 별도 환경 설정으로 검증한다.
vi.mock("@/lib/env", () => ({
  env: { adminApiUrl: "", apiUrl: "" },
}));

if (typeof Element.prototype.scrollIntoView !== "function") {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
    writable: true,
  });
}

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key: string) {
    return this.#values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.#values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.#values.delete(key);
  }

  setItem(key: string, value: string) {
    this.#values.set(key, value);
  }
}

if (typeof window.localStorage.setItem !== "function") {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
}
