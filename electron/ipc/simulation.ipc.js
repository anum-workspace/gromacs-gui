// ipc/simulation.ipc.js
const { ipcMain } = require("electron");
const { startSimulation } = require("../services/simulation/simulationManager");

function registerSimulationIPC() {
    ipcMain.handle("simulation:start", async (_, config) => {
        await startSimulation(config);
        return { success: true };
    });
}

module.exports = { registerSimulationIPC };
