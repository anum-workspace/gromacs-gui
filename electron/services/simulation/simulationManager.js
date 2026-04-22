// services/simulation/simulationManager.js
const { runProcess } = require("./processRunner");
const repo = require("../database/simulationRepo");

const runningProcesses = new Map();

async function startSimulation(config) {
    const { id, command, args, cwd } = config;

    const proc = runProcess(command, args, cwd, (data) => {
        console.log(`[SIM ${id}]`, data);
    });

    runningProcesses.set(id, proc);

    await repo.createSimulation({
        id,
        command,
        status: "running",
        workingDir: cwd,
        checkpoint: "state.cpt",
    });

    proc.on("exit", async () => {
        await repo.updateStatus(id, "finished");
    });
}

async function resumeSimulations() {
    const sims = await repo.getRunningSimulations();

    for (const sim of sims) {
        const parts = sim.command.split(" ");
        const cmd = parts[0];
        const args = parts.slice(1);

        runProcess(cmd, args, sim.workingDir, console.log);
    }
}

module.exports = {
    startSimulation,
    resumeSimulations,
};
