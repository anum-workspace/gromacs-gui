const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const isDev = !app.isPackaged;
// const isDev = false;

// Connect to the database
const dbPath = !app.isPackaged
    ? path.join(__dirname, "assets", "hadiths.db")
    : path.join(process.resourcesPath, "assets/hadiths.db");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    err ? console.error(err.message) : console.log("Database connected.");
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, "assets", "icon.png"),
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
    } else {
        mainWindow.setMenu(null);
        mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
        // mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);
        // mainWindow.maximize();
    }
}

ipcMain.handle("data-request", async (event, query) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(query, (err, rows) => {
                if (err) {
                    console.error("Error executing query:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
});
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

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
    db.close();
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
