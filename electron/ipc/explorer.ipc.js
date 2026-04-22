// ipc/explorer.ipc.js
const { ipcMain, dialog } = require("electron");
const { readDirRecursive } = require("../services/system/explorerService");

function registerExplorerIPC() {
    ipcMain.handle("explorer:openFolder", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (result.canceled) return null;

        const folderPath = result.filePaths[0];
        const tree = readDirRecursive(folderPath);

        return tree;
    });
}

module.exports = { registerExplorerIPC };
