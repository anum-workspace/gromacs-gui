const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    DBOperation: (query) => ipcRenderer.invoke("data-request", query),
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
});

// preload.js
contextBridge.exposeInMainWorld("terminal", {
    send: (cmd) => ipcRenderer.send("terminal:input", cmd),
    onData: (cb) => ipcRenderer.on("terminal:data", (_, d) => cb(d)),
});
