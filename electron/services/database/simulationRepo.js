const { getDB } = require("./db");

function createSimulation(sim) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO simulations VALUES (?, ?, ?, ?, ?)`,
            [sim.id, sim.command, sim.status, sim.workingDir, sim.checkpoint],
            (err) => (err ? reject(err) : resolve()),
        );
    });
}

function getRunningSimulations() {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM simulations WHERE status='running'`, (err, rows) =>
            err ? reject(err) : resolve(rows),
        );
    });
}

function updateStatus(id, status) {
    const db = getDB();

    return new Promise((resolve, reject) => {
        db.run(`UPDATE simulations SET status=? WHERE id=?`, [status, id], (err) =>
            err ? reject(err) : resolve(),
        );
    });
}

module.exports = {
    createSimulation,
    getRunningSimulations,
    updateStatus,
};
