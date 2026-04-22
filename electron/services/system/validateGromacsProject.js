const fs = require("fs");
const path = require("path");

function validateGromacsProject(gromacsPath) {
    const files = fs.readdirSync(gromacsPath);

    const hasTop = files.some((f) => f.endsWith(".top"));
    const hasStructure = files.some((f) => f.endsWith(".gro") || f.endsWith(".pdb"));
    const hasMDP = files.some((f) => f.endsWith(".mdp"));

    return {
        isValid: hasTop && hasStructure && hasMDP,
        details: {
            hasTop,
            hasStructure,
            hasMDP,
        },
    };
}

module.exports = { validateGromacsProject };
