const { Tray, Menu, app, dialog, BrowserWindow } = require("electron");
const path = require("path");

let tray = null;
let simulationRunning = false;

/**
 * Get main window safely
 */
function getMainWindow() {
    return BrowserWindow.getAllWindows()[0];
}

/**
 * Update tray tooltip + menu
 */
function updateTrayMenu() {
    if (!tray) return;

    tray.setToolTip(simulationRunning ? "Gromacs GUI - Simulation Running" : "Gromacs GUI - Idle");

    let isQuitting = false;

    const template = [
        {
            label: "Show Main Window",
            click: () => {
                const win = getMainWindow();
                if (win) win.show();
            },
        },

        { type: "separator" },

        {
            label: simulationRunning ? "Simulation Running..." : "Start Queue",
            enabled: false,
        },

        {
            label: "Stop Simulation",
            enabled: simulationRunning,
            click: async () => {
                const result = await dialog.showMessageBox({
                    type: "warning",
                    buttons: ["🟢 Continue", "🔴 Stop Simulation"],
                    defaultId: 0,
                    cancelId: 0,
                    title: "Stop Simulation",
                    message: "Are you sure you want to stop the simulation?",
                    detail: "Stopping may interrupt progress. You can resume later if checkpoint exists.",
                });

                if (result.response === 1) {
                    const win = getMainWindow();
                    if (win) {
                        // 🔥 emit event instead of calling service directly
                        win.webContents.send("tray:stopSimulation");
                    }

                    simulationRunning = false;
                    updateTrayMenu();
                }
            },
        },

        { type: "separator" },

        {
            label: "About",
            click: () => {
                dialog.showMessageBox({
                    type: "info",
                    title: "About",
                    message: "Gromacs GUI",
                    detail: "Molecular Dynamics Simulation Interface\nVersion 1.0",
                });
            },
        },

        {
            label: "Help",
            click: () => {
                const win = getMainWindow();
                if (win) {
                    win.webContents.send("tray:help");
                }
            },
        },

        { type: "separator" },

        {
            label: "Quit",
            click: async () => {
                if (simulationRunning) {
                    const result = await dialog.showMessageBox({
                        type: "warning",
                        buttons: ["Cancel", "Quit Anyway"],
                        defaultId: 0,
                        cancelId: 0,
                        title: "Quit Application",
                        message: "Simulation is still running!",
                        detail: "Are you sure you want to quit? You may lose progress.",
                    });

                    if (result.response !== 1) return;

                    // 🔴 OPTIONAL: stop simulation safely
                    try {
                        if (simulationProcess) {
                            simulationProcess.kill("SIGTERM"); // or SIGINT for graceful stop
                        }
                    } catch (err) {
                        console.error("Failed to stop simulation:", err);
                    }
                }

                // ✅ Mark real quitting (prevents window.hide())
                isQuitting = true;

                // ✅ Close DB safely
                try {
                    db.close();
                } catch (err) {
                    console.error("DB close error:", err);
                }

                // ✅ Quit app
                app.quit();
            },
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    tray.setContextMenu(menu);
}

/**
 * Public: update simulation status
 */
function setSimulationStatus(isRunning) {
    simulationRunning = isRunning;
    updateTrayMenu();
}

/**
 * Create tray
 */
function createTray() {
    tray = new Tray(path.join(__dirname, "../assets/icon.png"));

    tray.setToolTip("Gromacs GUI");

    tray.on("click", () => {
        const win = getMainWindow();
        if (win) win.show();
    });

    updateTrayMenu();
}

module.exports = {
    createTray,
    setSimulationStatus,
};
