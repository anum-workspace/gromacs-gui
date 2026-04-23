const { getDB } = require("./db");

function upsertSimulation(sim) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.run(
            `
                INSERT INTO simulations (
                    id,
                    command,
                    args,
                    status,
                    workingDir,
                    checkpoint,
                    source,
                    pid,
                    lastCommand,
                    resumeCommand,
                    queue,
                    currentStep,
                    totalSteps,
                    startedAt,
                    updatedAt,
                    completedAt,
                    exitCode,
                    autoResume
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    command=excluded.command,
                    args=excluded.args,
                    status=excluded.status,
                    workingDir=excluded.workingDir,
                    checkpoint=excluded.checkpoint,
                    source=excluded.source,
                    pid=excluded.pid,
                    lastCommand=excluded.lastCommand,
                    resumeCommand=excluded.resumeCommand,
                    queue=excluded.queue,
                    currentStep=excluded.currentStep,
                    totalSteps=excluded.totalSteps,
                    startedAt=excluded.startedAt,
                    updatedAt=excluded.updatedAt,
                    completedAt=excluded.completedAt,
                    exitCode=excluded.exitCode,
                    autoResume=excluded.autoResume
            `,
            [
                sim.id,
                sim.command,
                sim.args ?? "[]",
                sim.status,
                sim.workingDir,
                sim.checkpoint ?? null,
                sim.source ?? "ui",
                sim.pid ?? null,
                sim.lastCommand ?? null,
                sim.resumeCommand ?? null,
                sim.queue ?? "[]",
                sim.currentStep ?? 0,
                sim.totalSteps ?? 1,
                sim.startedAt ?? null,
                sim.updatedAt ?? null,
                sim.completedAt ?? null,
                sim.exitCode ?? null,
                sim.autoResume ? 1 : 0,
            ],
            (err) => (err ? reject(err) : resolve()),
        );
    });
}

function getRecoverableSimulations() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM simulations WHERE autoResume=1 AND status IN ('queued', 'running', 'resuming') ORDER BY updatedAt DESC`,
            (err, rows) => (err ? reject(err) : resolve(rows)),
        );
    });
}

function updateSimulation(id, fields) {
    const db = getDB();
    const entries = Object.entries(fields);

    if (!entries.length) {
        return Promise.resolve();
    }

    const setClause = entries.map(([key]) => `${key}=?`).join(", ");
    const values = entries.map(([, value]) => value);

    return new Promise((resolve, reject) => {
        db.run(`UPDATE simulations SET ${setClause} WHERE id=?`, [...values, id], (err) =>
            err ? reject(err) : resolve(),
        );
    });
}

function getLatestSimulation() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM simulations ORDER BY COALESCE(updatedAt, startedAt) DESC LIMIT 1`,
            (err, row) => (err ? reject(err) : resolve(row ?? null)),
        );
    });
}

function getActiveSimulation() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM simulations WHERE status IN ('queued', 'running', 'resuming', 'stopping') ORDER BY COALESCE(updatedAt, startedAt) DESC LIMIT 1`,
            (err, row) => (err ? reject(err) : resolve(row ?? null)),
        );
    });
}

function getSimulationById(id) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM simulations WHERE id=?`, [id], (err, row) =>
            err ? reject(err) : resolve(row ?? null),
        );
    });
}

module.exports = {
    upsertSimulation,
    getRecoverableSimulations,
    getActiveSimulation,
    getSimulationById,
    updateSimulation,
    getLatestSimulation,
};
