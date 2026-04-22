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

function findGromacsFolder(rootPath) {
    const baseName = path.basename(rootPath);

    // Case 1: user opened gromacs directly
    if (baseName.toLowerCase() === "gromacs") {
        return rootPath;
    }

    // Case 2: search inside
    const children = fs.readdirSync(rootPath);

    for (const child of children) {
        if (child.toLowerCase() === "gromacs") {
            return path.join(rootPath, child);
        }
    }

    return null;
}

module.exports = { readDirRecursive, findGromacsFolder };
