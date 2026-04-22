const { spawn } = require("child_process");

async function runProduction({ cwd, mdpFile, tpr, loops, useGPU }) {
    for (let i = 0; i < loops; i++) {
        await runCommand("gmx", ["grompp", "-f", mdpFile, "-o", `prod_${i}.tpr`], cwd);

        const args = ["mdrun", "-deffnm", `prod_${i}`];

        if (useGPU) {
            args.push("-nb", "gpu");
        }

        await runCommand("gmx", args, cwd);
    }
}

function runCommand(cmd, args, cwd) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args, { cwd });

        p.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(code);
        });
    });
}
