// ipc/simulation.ipc.js
const { ipcMain } = require("electron");
const { startSimulation } = require("../services/simulation/simulationManager");
const { parseMDP, updateMDP } = require("../services/simulation/mdpService");

function registerSimulationIPC() {
    ipcMain.handle("simulation:start", async (_, config) => {
        await startSimulation(config);
        return { success: true };
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
