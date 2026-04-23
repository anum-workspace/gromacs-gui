import TreeNode from "./TreeNode";
import { useFileTree } from "../hooks/useFileTree";
import { useEffect, useState } from "react";

export default function ExplorerPanel({ rootPath }) {
    const { tree, loadRoot, loadChildren } = useFileTree(rootPath);
    const [activePath, setActivePath] = useState(null);

    useEffect(() => {
        loadRoot();
    }, []);

    return (
        <div className="text-sm text-gray-200">
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
    );
}
