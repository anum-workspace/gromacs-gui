// ipc/explorer.ipc.js
const { ipcMain, dialog } = require("electron");
const path = require("path");
const { readDirRecursive } = require("../services/system/explorerService");
const { findGromacsFolder } = require("../services/system/explorerService");
const { validateGromacsProject } = require("../services/system/validateGromacsProject");

function registerExplorerIPC() {
    ipcMain.handle("explorer:openFolder", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (result.canceled) return null;

        const rootPath = result.filePaths[0];

        const gromacsPath = findGromacsFolder(rootPath);

        if (!gromacsPath) {
            return {
                error: "NOT_GROMACS_PROJECT",
            };
        }

        const validation = validateGromacsProject(gromacsPath);

        if (!validation.isValid) {
            return {
                error: "INVALID_GROMACS_PROJECT",
                details: validation.details,
            };
        }

        const tree = readDirRecursive(rootPath);

        return {
            rootPath,
            gromacsPath,
            tree,
        };
    });
}

module.exports = { registerExplorerIPC };
