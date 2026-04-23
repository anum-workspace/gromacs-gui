import { useEffect, useState } from "react";
import { simulationAPI } from "../services/simulationAPI.js";

function isActiveStatus(status) {
    return status === "queued" || status === "running" || status === "resuming";
}

export function useSimulation() {
    const [latest, setLatest] = useState(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void refreshLatest();

        const handleStatus = (payload) => {
            setLatest(payload);
            setRunning(isActiveStatus(payload?.status));
        };

        window.electron.on("simulation:status", handleStatus);
    }, []);

    const refreshLatest = async () => {
        const result = await simulationAPI.getLatest();
        setLatest(result);
        setRunning(isActiveStatus(result?.status));
        return result;
    };

    const runCommand = async ({ commandLine, cwd, source = "ui" }) => {
        setRunning(true);
        setError("");

        try {
            const result = await simulationAPI.startCommand({
                commandLine,
                cwd,
                source,
            });
            await refreshLatest();
            return result;
        } catch (runError) {
            setRunning(false);
            setError(runError.message);
            throw runError;
        }
    };

    const runQueue = async ({ queue, cwd, source = "ui" }) => {
        setRunning(true);
        setError("");

        try {
            const result = await simulationAPI.startQueue({
                queue,
                cwd,
                source,
            });
            await refreshLatest();
            return result;
        } catch (runError) {
            setRunning(false);
            setError(runError.message);
            throw runError;
        }
    };

    const stop = async (id) => {
        setError("");
        try {
            const result = await simulationAPI.stop({ id });
            await refreshLatest();
            return result;
        } catch (stopError) {
            setError(stopError.message);
            throw stopError;
        }
    };

    return {
        latest,
        running,
        error,
        refreshLatest,
        runCommand,
        runQueue,
        stop,
    };
}
