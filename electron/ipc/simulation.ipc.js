// ipc/simulation.ipc.js
const { ipcMain } = require("electron");
const {
    getLatestSimulation,
    startCommand,
    startSimulation,
    startSimulationQueue,
    stopSimulation,
} = require("../services/simulation/simulationManager");
const { parseMDP, updateMDP } = require("../services/simulation/mdpService");

function registerSimulationIPC() {
    ipcMain.handle("simulation:start", async (_, config) => {
        await startSimulation(config);
        return { success: true };
    });

    ipcMain.handle("simulation:startCommand", async (_, payload) => {
        return startCommand(payload.commandLine, payload);
    });

    ipcMain.handle("simulation:startQueue", async (_, payload) => {
        return startSimulationQueue(payload);
    });

    ipcMain.handle("simulation:getLatest", async () => {
        return getLatestSimulation();
    });

    ipcMain.handle("simulation:stop", async (_, payload) => {
        return stopSimulation(payload?.id);
    });

    ipcMain.handle("mdp:read", (_, filePath) => {
        return parseMDP(filePath);
    });

    ipcMain.handle("mdp:update", (_, { filePath, updates }) => {
        updateMDP(filePath, updates);
        return { success: true };
    });
}

module.exports = { registerSimulationIPC };
