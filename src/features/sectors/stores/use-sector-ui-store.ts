import { create } from "zustand";

export type SectorEditor =
  { mode: "create"; parentId: number | null } | { mode: "edit"; id: number };

interface SectorUiState {
  editor: SectorEditor | null;
  deletingId: number | null;
  syncOpen: boolean;
}

export const useSectorUiStore = create<SectorUiState>(() => ({
  editor: null,
  deletingId: null,
  syncOpen: false,
}));

export const sectorUiActions = {
  create: (parentId: number | null = null) =>
    useSectorUiStore.setState({ editor: { mode: "create", parentId } }),
  edit: (id: number) =>
    useSectorUiStore.setState({ editor: { mode: "edit", id } }),
  closeEditor: () => useSectorUiStore.setState({ editor: null }),
  confirmDelete: (id: number) => useSectorUiStore.setState({ deletingId: id }),
  closeDelete: () => useSectorUiStore.setState({ deletingId: null }),
  openSync: () =>
    useSectorUiStore.setState({
      syncOpen: true,
      editor: null,
      deletingId: null,
    }),
  closeSync: () => useSectorUiStore.setState({ syncOpen: false }),
};
