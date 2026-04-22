// features/properties/PropertiesPanel.jsx
import { useState, useEffect } from "react";

export default function PropertiesPanel({ mdpPath }) {
    const [nsteps, setNsteps] = useState("");
    const [dt, setDt] = useState("");

    useEffect(() => {
        if (!mdpPath) return;

        window.electron.invoke("mdp:read", mdpPath).then((data) => {
            setNsteps(data.nsteps || "");
            setDt(data.dt || "");
        });
    }, [mdpPath]);

    const handleSave = async () => {
        await window.electron.invoke("mdp:update", {
            filePath: mdpPath,
            updates: { nsteps, dt },
        });
    };

    const totalNs = (nsteps * dt) / 1000;

    return (
        <div className="p-2">
            <label>nsteps</label>
            <input value={nsteps} onChange={(e) => setNsteps(e.target.value)} />

            <label>dt</label>
            <input value={dt} onChange={(e) => setDt(e.target.value)} />

            <div>Total Time: {totalNs.toFixed(2)} ns</div>

            <button onClick={handleSave}>Save</button>
        </div>
    );
}
