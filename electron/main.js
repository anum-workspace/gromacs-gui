const { app, BrowserWindow, ipcMain } = require("electron");

const { createWindow } = require("./core/windowManager");
const { createTray } = require("./core/systemTray");
const { initIPC } = require("./ipc");
const { initDB } = require("./services/database/db");
const { resumeSimulations } = require("./services/simulation/simulationManager");

ipcMain.on("window:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on("window:maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
});

ipcMain.on("window:close", () => {
    BrowserWindow.getFocusedWindow()?.close();
});

app.whenReady().then(async () => {
    await initDB();
    initIPC();
    createWindow();
    createTray();

    // Resume simulations after restart
    await resumeSimulations();
});

app.on("window-all-closed", (event) => {
    event.preventDefault(); // 🔥 Prevent app quit
});

app.on("before-quit", () => {
    db.close();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
