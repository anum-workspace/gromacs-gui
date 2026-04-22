// services/system/explorerService.js
const fs = require("fs");
const path = require("path");

function readDirRecursive(dirPath) {
    const stats = fs.statSync(dirPath);

    if (stats.isFile()) {
        return {
            name: path.basename(dirPath),
            path: dirPath,
            type: "file",
        };
    }

    return {
        name: path.basename(dirPath),
        path: dirPath,
        type: "folder",
        children: fs
            .readdirSync(dirPath)
            .map((child) => readDirRecursive(path.join(dirPath, child))),
    };
}

module.exports = { readDirRecursive };
