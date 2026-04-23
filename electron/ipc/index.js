// ipc/index.js
const { registerExplorerIPC } = require("./explorer.ipc");
const { registerSimulationIPC } = require("./simulation.ipc");
const { registerTerminalIPC } = require("./terminal.ipc");
const { registerFsHandlersIPC } = require("./fsHandlers.ipc");

function initIPC() {
    registerSimulationIPC();
    registerTerminalIPC();
    registerExplorerIPC();
    registerFsHandlersIPC();
}

module.exports = { initIPC };
