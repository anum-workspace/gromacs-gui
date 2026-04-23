const { randomUUID } = require("crypto");
const path = require("path");
const { BrowserWindow } = require("electron");
const treeKill = require("tree-kill");
const { runProcess } = require("./processRunner");
const repo = require("../database/simulationRepo");
const { setSimulationStatus } = require("../../core/systemTray");
const {
    buildResumeCommand,
    inferCheckpointPath,
    isManagedSimulationCommand,
    parseCommandLine,
    toCommandLine,
} = require("./checkpointHandler");

const runningProcesses = new Map();
const stoppingProcesses = new Set();

async function startSimulation(config) {
    const normalized = normalizeQueueConfig({
        id: config.id,
        cwd: config.cwd,
        source: config.source ?? "ui",
        queue: [
            {
                command: config.command,
                args: config.args ?? [],
                commandLine: config.commandLine,
                checkpoint: config.checkpoint,
                resumable: isManagedSimulationCommand(config.command, config.args ?? []),
            },
        ],
    });

    return startSimulationQueue(normalized);
}

async function startCommand(commandLine, options = {}) {
    const parts = parseCommandLine(commandLine);
    if (!parts.length) {
        throw new Error("Command cannot be empty.");
    }

    const [command, ...args] = parts;

    return startSimulation({
        id: options.id,
        command,
        args,
        cwd: options.cwd,
        source: options.source ?? "ui",
        commandLine,
        checkpoint: options.checkpoint,
    });
}

async function startSimulationQueue(config) {
    const normalized = normalizeQueueConfig(config);

    if (!normalized.cwd) {
        throw new Error("A working directory is required to start a simulation queue.");
    }
    if (!normalized.queue.length) {
        throw new Error("Simulation queue cannot be empty.");
    }
    if (runningProcesses.has(normalized.id)) {
        throw new Error("A simulation queue with this id is already running.");
    }

    await repo.upsertSimulation(createSimulationRecord(normalized, {
        status: "queued",
        pid: null,
        exitCode: null,
        completedAt: null,
    }));
    await publishLatestStatus();
    broadcast(
        "terminal:data",
        `\r\n[simulation] Queued ${normalized.queue.length} step(s) in ${normalized.cwd}\r\n`,
    );

    runQueue(normalized.id).catch((error) => {
        void failQueue(normalized.id, error);
    });

    return {
        id: normalized.id,
        status: "queued",
        queueLength: normalized.queue.length,
    };
}

function canManageCommand(commandLine) {
    const parts = parseCommandLine(commandLine);
    if (!parts.length) return false;

    const [command, ...args] = parts;
    return isManagedSimulationCommand(command, args);
}

async function resumeSimulations() {
    const sims = await repo.getRecoverableSimulations();

    for (const sim of sims) {
        if (runningProcesses.has(sim.id)) continue;

        const queue = parseQueue(sim.queue, sim);
        if (!queue.length) continue;

        const currentStep = clampStepIndex(sim.currentStep, queue.length);
        const nextQueue = queue.map((step, index) => {
            if (index !== currentStep || !step.resumable) {
                return step;
            }

            const resumed = buildResumeCommand({
                command: step.command,
                args: step.args,
                checkpoint: step.checkpoint,
                workingDir: sim.workingDir,
            });

            return {
                ...step,
                args: resumed.args,
                resumeCommand: resumed.commandLine,
            };
        });

        await repo.upsertSimulation({
            ...sim,
            args: JSON.stringify(nextQueue[currentStep]?.args ?? []),
            queue: JSON.stringify(nextQueue),
            currentStep,
            totalSteps: nextQueue.length,
            status: "resuming",
            pid: null,
            updatedAt: new Date().toISOString(),
            completedAt: null,
        });

        broadcast(
            "terminal:data",
            `\r\n[simulation] Resuming queue step ${currentStep + 1}/${nextQueue.length}: ${nextQueue[currentStep]?.commandLine ?? ""}\r\n`,
        );

        runQueue(sim.id).catch((error) => {
            void failQueue(sim.id, error);
        });
    }
}

async function getLatestSimulation() {
    return repo.getLatestSimulation();
}

async function stopSimulation(id) {
    const target = id ? await repo.getSimulationById(id) : await repo.getActiveSimulation();
    if (!target) {
        return { success: false, message: "No active simulation found." };
    }

    stoppingProcesses.add(target.id);

    await repo.updateSimulation(target.id, {
        status: "stopping",
        updatedAt: new Date().toISOString(),
        autoResume: 0,
    });
    await publishLatestStatus();
    broadcast("terminal:data", `\r\n[simulation] Stopping simulation ${target.id}...\r\n`);

    const proc = runningProcesses.get(target.id);
    if (!proc?.pid) {
        await repo.updateSimulation(target.id, {
            status: "stopped",
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            exitCode: 130,
            pid: null,
            autoResume: 0,
        });
        stoppingProcesses.delete(target.id);
        await publishLatestStatus();
        return { success: true, id: target.id };
    }

    await new Promise((resolve, reject) => {
        treeKill(proc.pid, "SIGTERM", (error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    return { success: true, id: target.id };
}

async function runQueue(id) {
    const latest = await repo.getSimulationById(id);
    if (!latest) {
        return;
    }

    const queue = parseQueue(latest.queue, latest);
    if (!queue.length) {
        throw new Error("Saved simulation queue is empty.");
    }

    let currentStep = clampStepIndex(latest.currentStep, queue.length);

    while (currentStep < queue.length) {
        const step = queue[currentStep];
        const startPayload = createSimulationRecord(
            {
                id,
                cwd: latest.workingDir,
                source: latest.source ?? "ui",
                queue,
                currentStep,
                startedAt: latest.startedAt,
            },
            {
                status: latest.status === "resuming" ? "resuming" : "running",
                command: step.command,
                args: JSON.stringify(step.args),
                lastCommand: step.commandLine,
                resumeCommand: step.resumeCommand ?? step.commandLine,
                checkpoint: step.checkpoint ?? null,
                currentStep,
                totalSteps: queue.length,
                completedAt: null,
                exitCode: null,
            },
        );

        const exitCode = await runSingleStep(startPayload, step);
        if (exitCode !== 0) {
            return;
        }

        currentStep += 1;
        await repo.updateSimulation(id, {
            currentStep,
            status: currentStep >= queue.length ? "complete" : "queued",
            updatedAt: new Date().toISOString(),
            pid: null,
            exitCode: 0,
            completedAt: currentStep >= queue.length ? new Date().toISOString() : null,
        });
        await publishLatestStatus();
    }

    broadcast("terminal:data", `\r\n[simulation] Queue ${id} completed\r\n`);
}

async function runSingleStep(record, step) {
    const proc = runProcess(step.command, step.args, record.workingDir, (data) => {
        broadcast("simulation:output", {
            id: record.id,
            data,
            source: record.source,
        });
        broadcast("terminal:data", data);
    });

    runningProcesses.set(record.id, proc);

    await repo.upsertSimulation({
        ...record,
        pid: proc.pid,
        updatedAt: new Date().toISOString(),
    });
    await publishLatestStatus();
    broadcast(
        "terminal:data",
        `\r\n[simulation] Running step ${record.currentStep + 1}/${record.totalSteps}: ${step.commandLine}\r\n`,
    );

    return new Promise((resolve) => {
        proc.on("error", async (error) => {
            runningProcesses.delete(record.id);
            const wasStopping = stoppingProcesses.delete(record.id);
            await repo.updateSimulation(record.id, {
                status: wasStopping ? "stopped" : "failed",
                updatedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                exitCode: wasStopping ? 130 : -1,
                pid: null,
                autoResume: wasStopping ? 0 : 1,
            });
            broadcast(
                "terminal:data",
                wasStopping
                    ? `\r\n[simulation] Simulation stopped by user\r\n`
                    : `\r\n[simulation] ${error.message}\r\n`,
            );
            await publishLatestStatus();
            resolve(wasStopping ? 130 : -1);
        });

        proc.on("exit", async (code) => {
            runningProcesses.delete(record.id);
            const wasStopping = stoppingProcesses.delete(record.id);
            if (wasStopping) {
                await repo.updateSimulation(record.id, {
                    status: "stopped",
                    updatedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    exitCode: 130,
                    pid: null,
                    autoResume: 0,
                });
                broadcast(
                    "terminal:data",
                    `\r\n[simulation] Simulation stopped by user\r\n`,
                );
                await publishLatestStatus();
                resolve(130);
                return;
            }

            if (code !== 0) {
                await repo.updateSimulation(record.id, {
                    status: "failed",
                    updatedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    exitCode: code,
                    pid: null,
                });
                broadcast(
                    "terminal:data",
                    `\r\n[simulation] Step ${record.currentStep + 1}/${record.totalSteps} failed (exit ${code})\r\n`,
                );
                await publishLatestStatus();
            }
            resolve(code ?? 0);
        });
    });
}

async function failQueue(id, error) {
    runningProcesses.delete(id);
    stoppingProcesses.delete(id);
    await repo.updateSimulation(id, {
        status: "failed",
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        exitCode: -1,
        pid: null,
    });
    broadcast("terminal:data", `\r\n[simulation] ${error.message}\r\n`);
    await publishLatestStatus();
}

function normalizeQueueConfig(config) {
    const id = config.id ?? randomUUID();
    const cwd = config.cwd;
    const queue = (config.queue ?? [])
        .map((item) => normalizeQueueItem(item, cwd))
        .filter(Boolean);

    return {
        id,
        cwd,
        source: config.source ?? "ui",
        queue,
        currentStep: clampStepIndex(config.currentStep ?? 0, queue.length || 1),
        startedAt: config.startedAt ?? new Date().toISOString(),
    };
}

function normalizeQueueItem(item, cwd) {
    if (!item) return null;

    if (item.scriptPath) {
        item = {
            ...item,
            command: "bash",
            args: [resolveAssetScriptPath(item.scriptPath)],
        };
    }

    if (item.commandLine && (!item.command || !item.args)) {
        const parts = parseCommandLine(item.commandLine);
        if (!parts.length) return null;
        const [command, ...args] = parts;
        item = { ...item, command, args };
    }

    if (!item.command) return null;

    const args = item.args ?? [];
    const commandLine = item.commandLine ?? toCommandLine(item.command, args);
    const resumable =
        item.resumable ?? isManagedSimulationCommand(item.command, args);
    const checkpoint =
        item.checkpoint ??
        (resumable ? inferCheckpointPath(item.command, args, cwd) : null);
    const resume =
        resumable
            ? buildResumeCommand({
                  command: item.command,
                  args,
                  checkpoint,
                  workingDir: cwd,
              })
            : { commandLine };

    return {
        id: item.id ?? randomUUID(),
        name: item.name ?? deriveStepName(item.command, args),
        command: item.command,
        args,
        commandLine,
        resumable,
        checkpoint,
        resumeCommand: item.resumeCommand ?? resume.commandLine,
    };
}

function createSimulationRecord(config, overrides = {}) {
    const activeStep = config.queue?.[config.currentStep] ?? config.queue?.[0] ?? null;

    return {
        id: config.id,
        command: overrides.command ?? activeStep?.command ?? "",
        args: overrides.args ?? JSON.stringify(activeStep?.args ?? []),
        status: overrides.status ?? "queued",
        workingDir: config.cwd,
        checkpoint: overrides.checkpoint ?? activeStep?.checkpoint ?? null,
        source: config.source ?? "ui",
        pid: overrides.pid ?? null,
        lastCommand: overrides.lastCommand ?? activeStep?.commandLine ?? null,
        resumeCommand: overrides.resumeCommand ?? activeStep?.resumeCommand ?? activeStep?.commandLine ?? null,
        queue: overrides.queue ?? JSON.stringify(config.queue ?? []),
        currentStep: overrides.currentStep ?? config.currentStep ?? 0,
        totalSteps: overrides.totalSteps ?? config.queue?.length ?? 1,
        startedAt: config.startedAt ?? new Date().toISOString(),
        updatedAt: overrides.updatedAt ?? new Date().toISOString(),
        completedAt: overrides.completedAt ?? null,
        exitCode: overrides.exitCode ?? null,
        autoResume: true,
    };
}

function parseQueue(rawQueue, simulation) {
    try {
        const parsed = JSON.parse(rawQueue ?? "[]");
        if (Array.isArray(parsed) && parsed.length) {
            return parsed.map((item) => normalizeQueueItem(item, simulation.workingDir));
        }
    } catch {}

    if (simulation.command) {
        return [
            normalizeQueueItem(
                {
                    command: simulation.command,
                    args: parseArgs(simulation.args),
                    commandLine: simulation.lastCommand,
                    checkpoint: simulation.checkpoint,
                    resumeCommand: simulation.resumeCommand,
                    resumable: isManagedSimulationCommand(simulation.command, parseArgs(simulation.args)),
                },
                simulation.workingDir,
            ),
        ].filter(Boolean);
    }

    return [];
}

function parseArgs(value) {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function deriveStepName(command, args) {
    const base = path.basename(command);
    return [base, ...args.slice(0, 2)].join(" ").trim();
}

function resolveAssetScriptPath(scriptPath) {
    if (path.isAbsolute(scriptPath)) {
        return scriptPath;
    }

    return path.resolve(__dirname, "../../assets", scriptPath);
}

function clampStepIndex(value, length) {
    return Math.max(0, Math.min(Number(value) || 0, Math.max(0, length - 1)));
}

function broadcast(channel, payload) {
    for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send(channel, payload);
    }
}

async function publishLatestStatus() {
    const latest = await repo.getLatestSimulation();
    const isActive = ["queued", "running", "resuming", "stopping"].includes(latest?.status);
    setSimulationStatus(Boolean(isActive));
    broadcast("simulation:status", latest);
    return latest;
}

module.exports = {
    startSimulation,
    startCommand,
    startSimulationQueue,
    canManageCommand,
    getLatestSimulation,
    stopSimulation,
    resumeSimulations,
};
