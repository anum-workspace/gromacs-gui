// ipc/index.js
const { registerExplorerIPC } = require("./explorer.ipc");
const { registerSimulationIPC } = require("./simulation.ipc");
const { registerTerminalIPC } = require("./terminal.ipc");

function initIPC() {
    registerSimulationIPC();
    registerTerminalIPC();
    registerExplorerIPC();
}

module.exports = { initIPC };
