const { ipcMain, BrowserWindow } = require("electron");
const {
    startTerminal,
    writeToTerminal,
    resizeTerminal,
} = require("../services/terminal/terminalService");

function registerTerminalIPC() {
    ipcMain.on("terminal:start", (_, options) => {
        const win = BrowserWindow.getAllWindows()[0];

        startTerminal(win, options?.cwd);
    });

    ipcMain.on("terminal:input", (_, data) => {
        writeToTerminal(data);
    });

    ipcMain.on("terminal:resize", (_, size) => {
        resizeTerminal(size.cols, size.rows);
    });
}

module.exports = { registerTerminalIPC };
