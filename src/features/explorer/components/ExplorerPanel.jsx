import TreeNode from "./TreeNode";
import { useFileTree } from "../hooks/useFileTree";
import { useEffect, useState } from "react";

export default function ExplorerPanel({ rootPath }) {
    const { tree, loading, loadRoot, loadChildren } = useFileTree(rootPath);
    const [activePath, setActivePath] = useState(null);

    useEffect(() => {
        void loadRoot();
        setActivePath(null);
    }, [rootPath]);

    if (!rootPath) {
        return (
            <div className="p-3 text-sm text-gray-500">Open a project folder to browse files.</div>
        );
    }

    const rootName = rootPath.split(/[/\\]/).filter(Boolean).pop() ?? rootPath;

    if (loading && tree.length === 0) {
        return <div className="p-3 text-sm text-gray-400">Loading files...</div>;
    }

    return (
        <div className="h-full text-sm text-gray-300 overflow-hidden">
            <div className="border-b border-gray-700 px-2 py-1 font-semibold text-gray-300">
                📂 {rootName}
            </div>
            <div className="h-full px-1 pb-10 overflow-x-clip overflow-y-scroll scrollbar-dark">
                {tree.map((node, idx) => (
                    <TreeNode
                        key={node.path}
                        node={node}
                        isLast={idx === tree.length - 1}
                        parentLines={[]}
                        activePath={activePath}
                        setActivePath={setActivePath}
                        loadChildren={loadChildren}
                    />
                ))}
            </div>
        </div>
    );
}
