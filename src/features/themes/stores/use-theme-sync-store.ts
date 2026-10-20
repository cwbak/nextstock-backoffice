import { create } from "zustand";

import type { ThemeSyncProgress } from "@/data-access/queries/themes/sync";

interface ThemeSyncUiState {
  open: boolean;
  progress: ThemeSyncProgress | null;
}

export const useThemeSyncStore = create<ThemeSyncUiState>(() => ({
  open: false,
  progress: null,
}));

export const themeSyncActions = {
  setOpen: (open: boolean) =>
    useThemeSyncStore.setState({ open, progress: null }),
  setProgress: (progress: ThemeSyncProgress | null) =>
    useThemeSyncStore.setState({ progress }),
};
