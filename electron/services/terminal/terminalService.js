// services/terminal/terminalService.js
const pty = require("node-pty");
const { canManageCommand, startCommand } = require("../simulation/simulationManager");

let shell;
let winRef;
let lineBuffer = "";
let terminalCwd = process.env.HOME;

const cwdMarker = "\u001fPWD:";

function startTerminal(win, cwd) {
    if (shell) {
        shell.kill(); // restart with new path
    }

    winRef = win;
    lineBuffer = "";
    terminalCwd = cwd || process.env.HOME;

    shell = pty.spawn("bash", [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: terminalCwd,
        env: {
            ...process.env,
            PROMPT_COMMAND: `printf '${cwdMarker}%s\\u001f' "$PWD"`,
        },
    });

    shell.onData((data) => {
        terminalCwd = extractCwd(data) ?? terminalCwd;
        if (winRef) {
            winRef.webContents.send("terminal:data", normalizeTerminalOutput(stripMarkers(data)));
        }
    });
}

function writeToTerminal(data) {
    if (!shell) return;

    for (const char of data) {
        if (char === "\r") {
            const commandLine = lineBuffer.trim();
            lineBuffer = "";

            if (commandLine && canManageCommand(commandLine)) {
                shell.write("\u0015");
                shell.write("\r");
                shell.write(`echo '[simulation] Running managed command: ${escapeSingleQuotes(commandLine)}'\r`);

                void startCommand(commandLine, {
                    cwd: terminalCwd,
                    source: "cli",
                }).catch((error) => {
                    if (winRef) {
                        winRef.webContents.send("terminal:data", `\r\n[simulation] ${error.message}\r\n`);
                    }
                });
                continue;
            }
        } else if (char === "\u007f") {
            lineBuffer = lineBuffer.slice(0, -1);
        } else if (char === "\u0003") {
            lineBuffer = "";
        } else if (!/[\u0000-\u001f]/.test(char)) {
            lineBuffer += char;
        }

        shell.write(char);
    }
}

function resizeTerminal(cols, rows) {
    if (shell) shell.resize(cols, rows);
}

module.exports = {
    startTerminal,
    writeToTerminal,
    resizeTerminal,
};

function extractCwd(data) {
    const match = data.match(/\u001fPWD:([^\u001f]+)\u001f/);
    return match?.[1] ?? null;
}

function stripMarkers(data) {
    return data.replace(/\u001fPWD:[^\u001f]+\u001f/g, "");
}

function normalizeTerminalOutput(data) {
    return data.replace(/\r?\n/g, "\r\n");
}

function escapeSingleQuotes(value) {
    return value.replace(/'/g, `'\\''`);
}
