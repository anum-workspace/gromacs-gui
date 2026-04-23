const sqlite3 = require("sqlite3").verbose();

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database("gromacs.db", (err) => {
            if (err) return reject(err);

            db.run(
                `
        CREATE TABLE IF NOT EXISTS simulations (
          id TEXT PRIMARY KEY,
          command TEXT,
          status TEXT,
          workingDir TEXT,
          checkpoint TEXT
        )
      `,
                (err) => {
                    if (err) reject(err);
                    else resolve();
                },
            );
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
