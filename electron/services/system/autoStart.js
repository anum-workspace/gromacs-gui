const AutoLaunch = require("auto-launch");

const appLauncher = new AutoLaunch({
    name: "GromacsGui",
});

async function ensureAutoStart() {
    try {
        const enabled = await appLauncher.isEnabled();
        if (!enabled) {
            await appLauncher.enable();
        }
    } catch (error) {
        console.error("Unable to configure auto-start:", error);
    }
}

module.exports = { ensureAutoStart };
