// features/explorer/components/TreeNode.jsx
import { useState } from "react";

export default function TreeNode({ node }) {
    const [open, setOpen] = useState(false);

    const isFolder = node.type === "folder";

    return (
        <div className="ml-2">
            <div
                className="cursor-pointer hover:bg-gray-700 px-1 rounded -mr-100"
                onClick={() => isFolder && setOpen(!open)}
            >
                {isFolder ? (open ? "📂" : "📁") : "📄"} {node.name}
            </div>

            {isFolder && open && (
                <div className="ml-3">
                    {node.children.map((child) => (
                        <TreeNode key={child.path} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
}
