// features/explorer/store/explorerStore.js
import { create } from "zustand";

export const useExplorerStore = create((set) => ({
    tree: null,
    setTree: (tree) => set({ tree }),
}));
