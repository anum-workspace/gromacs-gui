import { useState } from "react";

export default function TreeNode({
    node,
    level = 0,
    isLast = true,
    parentLines = [],
    activePath,
    setActivePath,
    loadChildren,
}) {
    const [open, setOpen] = useState(false);
    const isFolder = node.type === "folder";

    const isActive = activePath === node.path;

    const toggle = async () => {
        if (isFolder) {
            if (!node.loaded) await loadChildren(node);
            setOpen(!open);
        } else {
            setActivePath(node.path);
        }
    };

    const children = node.children || [];

    return (
        <div>
            {/* ROW */}
            <div
                onClick={toggle}
                onContextMenu={(e) => {
                    e.preventDefault();
                    window.electron.ipcRenderer.send("ctx:open", node);
                }}
                className={`flex items-center cursor-pointer px-1 rounded ${
                    isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                }`}
            >
                {/* TREE LINES */}
                <div className="flex">
                    {parentLines.map((line, i) => (
                        <span key={i} className="w-4 text-gray-500">
                            {line ? "│" : " "}
                        </span>
                    ))}
                    <span className="w-4 text-gray-500">{isLast ? "└──" : "├──"}</span>
                </div>

                {/* ICON */}
                <span className="mr-1">{isFolder ? (open ? "📂" : "📁") : "📄"}</span>

                {node.name}
            </div>

            {/* CHILDREN */}
            {isFolder && open && (
                <div>
                    {children.map((child, idx) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            isLast={idx === children.length - 1}
                            parentLines={[...parentLines, !isLast]}
                            activePath={activePath}
                            setActivePath={setActivePath}
                            loadChildren={loadChildren}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
