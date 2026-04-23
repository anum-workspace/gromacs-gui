// features/explorer/store/explorerStore.js
import { create } from "zustand";

export const useExplorerStore = create((set) => ({
  tree: null,
  rootPath: null,
  gromacsPath: null,

  setProject: (data) =>
    set({
      tree: data.tree ?? null,
      rootPath: data.rootPath ?? null,
      gromacsPath: data.gromacsPath ?? null,
    }),
}));
