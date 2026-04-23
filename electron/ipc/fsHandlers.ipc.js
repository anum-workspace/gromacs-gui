const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

function registerFsHandlersIPC() {
    ipcMain.handle("fs:readDir", async (_, dirPath) => {
        return fs.readdirSync(dirPath, { withFileTypes: true }).map((entry) => ({
            name: entry.name,
            path: path.join(dirPath, entry.name),
            type: entry.isDirectory() ? "folder" : "file",
            loaded: false,
            children: null,
        }));
    });

    ipcMain.handle("fs:readFile", async (_, filePath) => {
        return fs.readFileSync(filePath, "utf-8");
    });

    ipcMain.handle("fs:writeFile", async (_, payload) => {
        fs.writeFileSync(payload.path, payload.content, "utf-8");
        return { success: true };
    });
}

module.exports = { registerFsHandlersIPC };
