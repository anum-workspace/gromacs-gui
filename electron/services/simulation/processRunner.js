// services/simulation/processRunner.js
const { spawn } = require("child_process");

function runProcess(command, args, cwd, onData) {
    const proc = spawn(command, args, {
        cwd,
        env: process.env,
    });

    proc.stdout.on("data", (data) => {
        onData(data.toString());
    });

    proc.stderr.on("data", (data) => {
        onData(data.toString());
    });

    return proc;
}

module.exports = { runProcess };
