// features/navbar/Navbar.jsx
import { explorerAPI } from "../explorer/services/explorerAPI";
import { useExplorerStore } from "../explorer/store/explorerStore";

export default function Navbar() {
    const setTree = useExplorerStore((s) => s.setTree);

    const handleOpen = async () => {
        const tree = await explorerAPI.openFolder();
        if (tree) setTree(tree);
    };

    return (
        <div className="flex items-center justify-between px-4 h-full bg-gray-800">
            <div className="font-semibold">Gromacs GUI</div>

            <div className="flex gap-4 text-sm">
                <button>New</button>
                <button onClick={handleOpen}>Open</button>
                <button>Run</button>
            </div>
        </div>
    );
}
