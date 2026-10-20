import { create } from "zustand";
import type { SectorView } from "@/features/sectors/sector-browser";

export type SectorEditor =
  { mode: "create"; parentId: number | null } | { mode: "edit"; id: number };

interface SectorUiState {
  editor: SectorEditor | null;
  deletingId: number | null;
  syncOpen: boolean;
  browserView: SectorView;
  selectedMajorId: number | null;
  selectedMiddleId: number | null;
  selectedSectorId: number | null;
}

export const useSectorUiStore = create<SectorUiState>(() => ({
  editor: null,
  deletingId: null,
  syncOpen: false,
  browserView: "all",
  selectedMajorId: null,
  selectedMiddleId: null,
  selectedSectorId: null,
}));

export const sectorUiActions = {
  setBrowserView: (browserView: SectorView) =>
    useSectorUiStore.setState({ browserView, selectedSectorId: null }),
  selectMajor: (selectedMajorId: number) =>
    useSectorUiStore.setState({
      selectedMajorId,
      selectedMiddleId: null,
      selectedSectorId: selectedMajorId,
    }),
  selectMiddle: (selectedMiddleId: number) =>
    useSectorUiStore.setState({
      selectedMiddleId,
      selectedSectorId: selectedMiddleId,
    }),
  selectSector: (selectedSectorId: number) =>
    useSectorUiStore.setState({ selectedSectorId }),
  resetBrowser: () =>
    useSectorUiStore.setState({
      browserView: "all",
      selectedMajorId: null,
      selectedMiddleId: null,
      selectedSectorId: null,
    }),
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
