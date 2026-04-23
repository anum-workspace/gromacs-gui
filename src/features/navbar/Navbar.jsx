// features/navbar/Navbar.jsx
import { FaFolderPlus, FaPlay } from "react-icons/fa6";
import { explorerAPI } from "../explorer/services/explorerAPI";
import { useExplorerStore } from "../explorer/store/explorerStore";
import { BsCpuFill, BsGpuCard } from "react-icons/bs";
import { useState } from "react";
import {
    VscChromeClose,
    VscChromeMaximize,
    VscChromeMinimize,
    VscChromeRestore,
} from "react-icons/vsc";

export default function Navbar() {
    const setProject = useExplorerStore((s) => s.setProject);
    const [isMaximized, setIsMaximized] = useState(true);

    const handleToggleMaximize = () => {
        window.electronAPI.maximize();
        setIsMaximized((current) => !current);
    };

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
        <div className="flex items-center justify-between px-4 h-full bg-gray-800" style={{ WebkitAppRegion: "drag" }}>
            <div className="flex w-[15%] items-center font-semibold">
                <img src="icon.png" alt="Al Hadith" className="w-6 -ml-2 mr-2 rounded-sm" />
                Gromacs GUI
            </div>

            <div className="flex w-[70%] items-center justify-between gap-2 text-sm" >
                <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" }}>
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
                </div>
                <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" }}>
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

            {/* Window Manager */}
            <div
                className="flex w-[15%] items-center justify-end gap-1 sm:gap-3"
                style={{ WebkitAppRegion: "drag" }}
            >
                <div className="flex -mr-4" style={{ WebkitAppRegion: "no-drag" }}>
                    <button
                        onClick={() => window.electronAPI.minimize()}
                        className="flex h-8 w-11 items-center justify-center text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                        aria-label="Minimize window"
                    >
                        <VscChromeMinimize />
                    </button>
                    <button
                        onClick={handleToggleMaximize}
                        className="flex h-8 w-11 items-center justify-center text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                        aria-label={isMaximized ? "Restore window" : "Maximize window"}
                    >
                        {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
                    </button>
                    <button
                        onClick={() => window.electronAPI.close()}
                        className="flex h-8 w-11 items-center justify-center text-gray-300 transition-colors hover:bg-red-500 hover:text-white"
                        aria-label="Close window"
                    >
                        <VscChromeClose />
                    </button>
                </div>
            </div>
        </div>
    );
}
