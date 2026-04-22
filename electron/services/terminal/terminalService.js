// services/terminal/terminalService.js
const pty = require("node-pty");

let shell;
let winRef;

function startTerminal(win) {
    if (shell) return; // prevent duplicate

    winRef = win;

    shell = pty.spawn("bash", [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });

    shell.onData((data) => {
        if (winRef) {
            winRef.webContents.send("terminal:data", data);
        }
    });
}

function writeToTerminal(data) {
    if (shell) shell.write(data);
}

function resizeTerminal(cols, rows) {
    if (shell) shell.resize(cols, rows);
}

module.exports = {
    startTerminal,
    writeToTerminal,
    resizeTerminal,
};
