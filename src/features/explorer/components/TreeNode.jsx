import { useState } from "react";
import { useEditorStore } from "../../editor/store/editorStore.js";

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
    const openFile = useEditorStore((state) => state.openFile);
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

    const handleDoubleClick = async () => {
        if (isFolder) return;

        setActivePath(node.path);
        await openFile(node.path);
    };

    const children = node.children || [];

    return (
        <div>
            {/* ROW */}
            <div
                onClick={toggle}
                onDoubleClick={handleDoubleClick}
                onContextMenu={(e) => {
                    e.preventDefault();
                    window.electron.send("ctx:open", node);
                }}
                className={`flex items-center cursor-pointer px-1 rounded ${
                    isActive ? "bg-gray-800 text-gray-300" : "hover:bg-gray-700"
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
