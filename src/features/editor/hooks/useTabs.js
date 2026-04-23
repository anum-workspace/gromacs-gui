import { useState } from "react";
import { fileSystemAPI } from "../../../core/ipc/fileSystem.api.js";

export function useTabs() {
    const [tabs, setTabs] = useState([]);
    const [active, setActive] = useState(null);

    const openFile = async (path) => {
        const content = await fileSystemAPI.readFile(path);

        setTabs((prev) => {
            if (prev.find((t) => t.path === path)) return prev;

            return [
                ...prev,
                {
                    path,
                    name: path.split("/").pop(),
                    content,
                },
            ];
        });

        setActive(path);
    };

    const closeTab = (path) => {
        setTabs((prev) => {
            const nextTabs = prev.filter((t) => t.path !== path);
            if (active === path) {
                setActive(nextTabs[0]?.path || null);
            }
            return nextTabs;
        });
    };

    return { tabs, active, openFile, closeTab, setActive };
}
