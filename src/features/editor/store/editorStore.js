import { create } from "zustand";
import { fileSystemAPI } from "../../../core/ipc/fileSystem.api.js";

export const HOME_TAB_ID = "__home__";

const homeTab = {
    path: HOME_TAB_ID,
    name: "Home",
    content: "",
    dirty: false,
    closable: false,
};

export const useEditorStore = create((set, get) => ({
    tabs: [homeTab],
    active: HOME_TAB_ID,

    setActive: (path) => set({ active: path }),

    openFile: async (path) => {
        const existing = get().tabs.find((tab) => tab.path === path);
        if (existing) {
            set({ active: path });
            return;
        }

        const content = await fileSystemAPI.readFile(path);

        set((state) => ({
            tabs: [
                ...state.tabs,
                {
                    path,
                    name: path.split(/[/\\]/).pop() ?? path,
                    content,
                    dirty: false,
                    closable: true,
                },
            ],
            active: path,
        }));
    },

    updateTabContent: (path, content) =>
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.path === path
                    ? {
                          ...tab,
                          content,
                          dirty: true,
                      }
                    : tab,
            ),
        })),

    saveTab: async (path) => {
        const tab = get().tabs.find((entry) => entry.path === path);
        if (!tab || tab.path === HOME_TAB_ID) return false;

        await fileSystemAPI.writeFile(tab.path, tab.content);

        set((state) => ({
            tabs: state.tabs.map((entry) =>
                entry.path === path
                    ? {
                          ...entry,
                          dirty: false,
                      }
                    : entry,
            ),
        }));

        return true;
    },

    saveActiveTab: async () => {
        const { active, saveTab } = get();
        return saveTab(active);
    },

    closeTab: (path) => {
        if (path === HOME_TAB_ID) return;

        set((state) => {
            const nextTabs = state.tabs.filter((tab) => tab.path !== path);
            const nextActive =
                state.active === path ? nextTabs[nextTabs.length - 1]?.path ?? HOME_TAB_ID : state.active;

            return {
                tabs: nextTabs.length ? nextTabs : [homeTab],
                active: nextActive,
            };
        });
    },
}));
