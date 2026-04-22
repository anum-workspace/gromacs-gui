// features/explorer/ExplorerPanel.jsx
import { useExplorerStore } from "./store/explorerStore";
import TreeNode from "./components/TreeNode";

export default function ExplorerPanel() {
    const tree = useExplorerStore((s) => s.tree);

    if (!tree) {
        return <div className="p-2 text-sm">No project opened</div>;
    }

    return (
        <div className="p-2 text-sm overflow-x-hidden overflow-y-scroll scrollbar-dark h-full">
            <TreeNode node={tree} />
        </div>
    );
}
