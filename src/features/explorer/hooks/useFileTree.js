import { useState } from "react";
import { fileSystemAPI } from "../../../core/ipc/fileSystem.api";

export function useFileTree(rootPath) {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadRoot = async () => {
        setLoading(true);
        const data = await fileSystemAPI.readDir(rootPath);
        setTree(data);
        setLoading(false);
    };

    const loadChildren = async (node) => {
        if (node.loaded) return node.children;

        const children = await fileSystemAPI.readDir(node.path);

        node.children = children;
        node.loaded = true;

        setTree([...tree]);
    };

    return { tree, loadRoot, loadChildren };
}