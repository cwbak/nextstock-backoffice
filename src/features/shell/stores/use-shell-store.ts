import { create } from "zustand";

export type Theme = "dark" | "light";

interface ShellState {
  mobileNavigationOpen: boolean;
  setMobileNavigationOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "stock-note-theme";

function isTheme(value: string | undefined): value is Theme {
  return value === "dark" || value === "light";
}

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  const documentTheme = document.documentElement.dataset.theme;

  if (isTheme(documentTheme)) {
    return documentTheme;
  }

  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0c1211" : "#f6f8f7");
}

export const useShellStore = create<ShellState>((set, get) => ({
  mobileNavigationOpen: false,
  setMobileNavigationOpen: (mobileNavigationOpen) =>
    set({ mobileNavigationOpen }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  theme: getInitialTheme(),
  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },
}));

export const selectMobileNavigationOpen = (state: ShellState) =>
  state.mobileNavigationOpen;
export const selectSetMobileNavigationOpen = (state: ShellState) =>
  state.setMobileNavigationOpen;
export const selectTheme = (state: ShellState) => state.theme;
export const selectToggleTheme = (state: ShellState) => state.toggleTheme;
