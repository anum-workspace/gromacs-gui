const fs = require("fs");

function parseMDP(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const data = {};

    for (let line of lines) {
        line = line.split(";")[0].trim(); // remove comments
        if (!line) continue;

        const [key, value] = line.split("=").map((s) => s.trim());
        if (key && value) {
            data[key] = value;
        }
    }

    return data;
}

function updateMDP(filePath, updates) {
    let content = fs.readFileSync(filePath, "utf-8");

    for (const key in updates) {
        const regex = new RegExp(`^\\s*${key}\\s*=.*$`, "gm");

        if (content.match(regex)) {
            content = content.replace(regex, `${key} = ${updates[key]}`);
        } else {
            content += `\n${key} = ${updates[key]}`;
        }
    }

    fs.writeFileSync(filePath, content);
}

module.exports = { parseMDP, updateMDP };
