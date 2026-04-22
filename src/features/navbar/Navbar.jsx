// features/navbar/Navbar.jsx
import { FaFolderPlus, FaPlay } from "react-icons/fa6";
import { explorerAPI } from "../explorer/services/explorerAPI";
import { useExplorerStore } from "../explorer/store/explorerStore";
import { BsCpuFill, BsGpuCard } from "react-icons/bs";
import { useState } from "react";

export default function Navbar() {
    const setProject = useExplorerStore((s) => s.setProject);

    const handleOpen = async () => {
        const result = await explorerAPI.openFolder();

        if (!result) return;

        if (result.error === "NOT_GROMACS_PROJECT") {
            alert("❌ Not a valid GROMACS project (missing 'gromacs' folder)");
            return;
        }
        if (result.error === "INVALID_GROMACS_PROJECT") {
            alert(`
            ❌ Invalid GROMACS project

            Missing:
            ${!result.details.hasTop ? "- topology (*.top)\n" : ""}
            ${!result.details.hasStructure ? "- structure (*.gro/.pdb)\n" : ""}
            ${!result.details.hasMDP ? "- parameter (*.mdp)\n" : ""}
            `);
        }
        setProject(result);
    };

    const [device, setDevice] = useState("gpu");

    return (
        <div className="flex items-center justify-between px-4 h-full bg-gray-800">
            <div className="font-semibold">Gromacs GUI</div>

            <div className="flex items-center gap-2 text-sm">
                <button className="cursor-pointer hover:bg-gray-700 px-2 py-1 rounded-sm">
                    New
                </button>

                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-2 py-1 rounded-sm"
                >
                    <FaFolderPlus />
                    Open
                </button>
                {device == "cpu" ? <BsCpuFill /> : <BsGpuCard />}
                <select
                    onChange={(e) => setDevice(e.target.value)}
                    className="bg-gray-800 py-1 cursor-pointer"
                    defaultValue="gpu"
                >
                    <option value="cpu" className="flex items-center gap-2 p-4">
                        CPU
                    </option>
                    <option value="gpu" className="flex items-center gap-2 p-4">
                        GPU
                    </option>
                </select>
                <button className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-2 py-1 rounded-sm">
                    <FaPlay />
                    Run
                </button>
            </div>
        </div>
    );
}
