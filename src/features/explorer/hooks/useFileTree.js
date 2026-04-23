import { useState } from "react";
import { fileSystemAPI } from "../../../core/ipc/fileSystem.api";

export function useFileTree(rootPath) {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadRoot = async () => {
        if (!rootPath) {
            setTree([]);
            return;
        }

        setLoading(true);
        try {
            const data = await fileSystemAPI.readDir(rootPath);
            setTree(data);
        } finally {
            setLoading(false);
        }
    };

    const loadChildren = async (node) => {
        if (node.loaded || node.type !== "folder") return node.children ?? [];

        const children = await fileSystemAPI.readDir(node.path);
        setTree((currentTree) =>
            updateNode(currentTree, node.path, {
                children,
                loaded: true,
            }),
        );

        return children;
    };

    return { tree, loading, loadRoot, loadChildren };
}

function updateNode(nodes, targetPath, patch) {
    return nodes.map((entry) => {
        if (entry.path === targetPath) {
            return { ...entry, ...patch };
        }

        if (entry.children?.length) {
            return {
                ...entry,
                children: updateNode(entry.children, targetPath, patch),
            };
        }

        return entry;
    });
}
