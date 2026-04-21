import pty from "node-pty";

const shell = pty.spawn("bash", [], {
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
});

shell.onData((data) => {
    win.webContents.send("terminal:data", data);
});
