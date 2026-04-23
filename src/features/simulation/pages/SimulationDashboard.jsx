import { useEffect, useState } from "react";
import { useExplorerStore } from "../../explorer/store/explorerStore.js";
import { useSimulation } from "../hooks/useSimulation.js";

const SCRIPT_QUEUE_PRESETS = [
    {
        id: "energy_minimization",
        name: "Energy Minimization",
        scriptPath: "energy_minimization.sh",
    },
    {
        id: "equilibration_gpu",
        name: "Equilibration",
        scriptPath: "equilibration_gpu.sh",
    },
    {
        id: "production_gpu",
        name: "Production",
        scriptPath: "production_gpu.sh",
    },
    {
        id: "resume_gpu",
        name: "Resume Production",
        scriptPath: "resume_gpu.sh",
    },
];

export default function SimulationDashboard() {
    const gromacsPath = useExplorerStore((state) => state.gromacsPath);
    const { latest, running, error, runCommand, runQueue, stop } = useSimulation();
    const [commandLine, setCommandLine] = useState("gmx mdrun -deffnm md_0_1");
    const [selectedScripts, setSelectedScripts] = useState(() =>
        SCRIPT_QUEUE_PRESETS.filter((item) => item.id !== "resume_gpu").map((item) => item.id),
    );

    useEffect(() => {
        if (latest?.lastCommand) {
            setCommandLine(latest.lastCommand);
        }
    }, [latest?.lastCommand]);

    const handleRun = async () => {
        if (!gromacsPath) return;
        await runCommand({
            commandLine,
            cwd: gromacsPath,
            source: "ui",
        });
    };

    const handleRunQueue = async () => {
        if (!gromacsPath || selectedScripts.length === 0) return;

        const queue = SCRIPT_QUEUE_PRESETS.filter((item) => selectedScripts.includes(item.id)).map((item) => ({
            id: item.id,
            name: item.name,
            scriptPath: item.scriptPath,
            resumable: false,
        }));

        await runQueue({
            queue,
            cwd: gromacsPath,
            source: "ui",
        });
    };

    const toggleScript = (scriptId) => {
        setSelectedScripts((current) =>
            current.includes(scriptId)
                ? current.filter((id) => id !== scriptId)
                : [...current, scriptId],
        );
    };

    const handleStop = async () => {
        await stop(latest?.id);
    };

    return (
        <div className="h-full overflow-auto bg-gray-950 p-5 text-gray-100 scrollbar-dark">
            <div className="mx-auto flex max-w-5xl flex-col gap-5">
                <div>
                    <h1 className="text-xl font-semibold">Simulation Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Managed runs save the last command and automatically resume after the app restarts.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
                    <section className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="font-medium">Run Command</h2>
                                <p className="text-sm text-gray-400">
                                    UI runs and terminal `gmx mdrun` commands use the same persistent runner.
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    running
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                }`}
                            >
                                {running ? "Running" : "Idle"}
                            </span>
                        </div>

                        <label className="mb-2 block text-sm text-gray-300">Command</label>
                        <textarea
                            className="min-h-28 w-full rounded-lg border border-gray-700 bg-gray-950 p-3 font-mono text-sm text-gray-100 outline-none"
                            value={commandLine}
                            onChange={(event) => setCommandLine(event.target.value)}
                            spellCheck={false}
                            placeholder="gmx mdrun -deffnm md_0_1"
                        />

                        <div className="mt-3 text-sm text-gray-400">
                            Working directory: {gromacsPath ?? "Open a GROMACS project to enable managed runs."}
                        </div>

                        {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}

                        <button
                            className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-700 cursor-pointer"
                            disabled={!gromacsPath || running || !commandLine.trim()}
                            onClick={() => {
                                void handleRun();
                            }}
                        >
                            {running ? "Simulation Running" : "Run Managed Simulation"}
                        </button>
                        <button
                            className="ml-3 mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-700 cursor-pointer"
                            disabled={!running}
                            onClick={() => {
                                void handleStop();
                            }}
                        >
                            Stop Simulation
                        </button>
                    </section>

                    <section className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                        <h2 className="font-medium">Last Saved State</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <InfoRow label="Status" value={latest?.status ?? "No simulation saved yet"} />
                            <InfoRow label="Source" value={latest?.source ?? "n/a"} />
                            <InfoRow label="Command" value={latest?.lastCommand ?? "n/a"} mono />
                            <InfoRow label="Resume" value={latest?.resumeCommand ?? "n/a"} mono />
                            <InfoRow label="Working Dir" value={latest?.workingDir ?? "n/a"} mono />
                            <InfoRow label="Checkpoint" value={latest?.checkpoint ?? "n/a"} mono />
                            <InfoRow
                                label="Queue Progress"
                                value={
                                    latest?.totalSteps
                                        ? `${Math.min((latest?.currentStep ?? 0) + (latest?.status === "complete" ? 0 : 1), latest.totalSteps)} / ${latest.totalSteps}`
                                        : "n/a"
                                }
                            />
                        </div>
                    </section>
                </div>

                <section className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                    <div className="mb-3">
                        <h2 className="font-medium">Queued Script Pipeline</h2>
                        <p className="text-sm text-gray-400">
                            Select any number of scripts. The app will run them one by one and restart from the interrupted step after reboot.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {SCRIPT_QUEUE_PRESETS.map((script) => {
                            const checked = selectedScripts.includes(script.id);
                            return (
                                <label
                                    key={script.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 ${
                                        checked
                                            ? "border-emerald-500 bg-emerald-500/10"
                                            : "border-gray-800 bg-gray-950/60"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={checked}
                                        onChange={() => toggleScript(script.id)}
                                    />
                                    <div>
                                        <div className="font-medium">{script.name}</div>
                                        <div className="mt-1 break-all font-mono text-xs text-gray-400">
                                            bash {script.scriptPath}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <button
                        className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-700 cursor-pointer"
                        disabled={!gromacsPath || running || selectedScripts.length === 0}
                        onClick={() => {
                            void handleRunQueue();
                        }}
                    >
                        {running ? "Queue Running" : "Run Selected Queue"}
                    </button>
                </section>
            </div>
        </div>
    );
}

function InfoRow({ label, value, mono = false }) {
    return (
        <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className={mono ? "break-all rounded bg-gray-950 px-2 py-2 font-mono text-xs" : ""}>
                {value}
            </div>
        </div>
    );
}
