const sqlite3 = require("sqlite3").verbose();

let db;

const simulationColumns = {
    args: "TEXT",
    source: "TEXT",
    pid: "INTEGER",
    lastCommand: "TEXT",
    resumeCommand: "TEXT",
    queue: "TEXT",
    currentStep: "INTEGER DEFAULT 0",
    totalSteps: "INTEGER DEFAULT 1",
    startedAt: "TEXT",
    updatedAt: "TEXT",
    completedAt: "TEXT",
    exitCode: "INTEGER",
    autoResume: "INTEGER DEFAULT 1",
};

function initDB() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database("gromacs.db", (err) => {
            if (err) return reject(err);

            db.run(
                `
        CREATE TABLE IF NOT EXISTS simulations (
          id TEXT PRIMARY KEY,
          command TEXT,
          args TEXT,
          status TEXT,
          workingDir TEXT,
          checkpoint TEXT,
          source TEXT,
          pid INTEGER,
          lastCommand TEXT,
          resumeCommand TEXT,
          startedAt TEXT,
          updatedAt TEXT,
          completedAt TEXT,
          exitCode INTEGER,
          autoResume INTEGER DEFAULT 1
        )
      `,
                async (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    try {
                        await ensureSimulationColumns();
                        resolve();
                    } catch (migrationError) {
                        reject(migrationError);
                    }
                },
            );
        });
    });
}

function ensureSimulationColumns() {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(simulations)`, async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const existingColumns = new Set(rows.map((row) => row.name));

            try {
                for (const [column, definition] of Object.entries(simulationColumns)) {
                    if (!existingColumns.has(column)) {
                        await runStatement(`ALTER TABLE simulations ADD COLUMN ${column} ${definition}`);
                    }
                }

                resolve();
            } catch (migrationError) {
                reject(migrationError);
            }
        });
    });
}

function runStatement(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function getDB() {
    return db;
}

function closeDB() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error("Error closing DB:", err);
            } else {
                console.log("DB closed");
            }
        });
        db = null;
    }
}

module.exports = { initDB, getDB, closeDB };
