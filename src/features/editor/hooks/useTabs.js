import { useState } from "react";
import { fileSystemAPI } from "../../../core/ipc/fileSystem.api";

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
        setTabs((prev) => prev.filter((t) => t.path !== path));

        if (active === path) {
            const next = tabs.find((t) => t.path !== path);
            setActive(next?.path || null);
        }
    };

    return { tabs, active, openFile, closeTab, setActive };
}
