// core/windowManager.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, "assets", "icon.png"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "../preload.js"),
        },
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
        win.maximize();
    } else {
        win.setMenu(null);
        win.loadFile(path.join(__dirname, "dist", "index.html"));
    }
}

module.exports = { createWindow };
