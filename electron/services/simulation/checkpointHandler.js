const fs = require("fs");
const path = require("path");

function parseCommandLine(commandLine) {
    const tokens = [];
    let current = "";
    let quote = null;
    let escapeNext = false;

    for (const char of commandLine.trim()) {
        if (escapeNext) {
            current += char;
            escapeNext = false;
            continue;
        }

        if (char === "\\") {
            escapeNext = true;
            continue;
        }

        if (quote) {
            if (char === quote) {
                quote = null;
            } else {
                current += char;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }

        if (/\s/.test(char)) {
            if (current) {
                tokens.push(current);
                current = "";
            }
            continue;
        }

        current += char;
    }

    if (current) {
        tokens.push(current);
    }

    return tokens;
}

function toCommandLine(command, args = []) {
    return [command, ...args].map(quoteArg).join(" ");
}

function quoteArg(value) {
    if (value == null || value === "") {
        return '""';
    }

    return /[\s"'\\]/.test(value) ? `"${String(value).replace(/(["\\$`])/g, "\\$1")}"` : String(value);
}

function isManagedSimulationCommand(command, args = []) {
    const normalized = path.basename(command);
    if (normalized === "mdrun") return true;

    return (
        ["gmx", "gmx_mpi", "gmx_d", "gmx_mpi_d"].includes(normalized) &&
        args[0] === "mdrun"
    );
}

function inferCheckpointPath(command, args = [], cwd) {
    const explicit = findArgValue(args, "-cpi");
    if (explicit) {
        return resolvePath(cwd, explicit);
    }

    const deffnm = findArgValue(args, "-deffnm");
    if (deffnm) {
        return resolvePath(cwd, `${deffnm}.cpt`);
    }

    return resolvePath(cwd, "state.cpt");
}

function buildResumeCommand({ command, args = [], checkpoint, workingDir }) {
    if (!isManagedSimulationCommand(command, args)) {
        return {
            command,
            args,
            commandLine: toCommandLine(command, args),
        };
    }

    const nextArgs = [...args];
    const checkpointPath = checkpoint ?? inferCheckpointPath(command, args, workingDir);

    if (checkpointPath && fs.existsSync(checkpointPath)) {
        const existingCheckpoint = findArgValue(nextArgs, "-cpi");
        if (!existingCheckpoint) {
            nextArgs.push("-cpi", checkpointPath);
        }
    }

    return {
        command,
        args: nextArgs,
        commandLine: toCommandLine(command, nextArgs),
    };
}

function findArgValue(args, flag) {
    const index = args.findIndex((arg) => arg === flag);
    return index >= 0 ? args[index + 1] ?? null : null;
}

function resolvePath(cwd, target) {
    if (!target) return null;
    return path.isAbsolute(target) ? target : path.join(cwd, target);
}

module.exports = {
    buildResumeCommand,
    inferCheckpointPath,
    isManagedSimulationCommand,
    parseCommandLine,
    toCommandLine,
};
