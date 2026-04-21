// autoStart.js
import AutoLaunch from "auto-launch";

const appLauncher = new AutoLaunch({
    name: "GromacsGui",
});

appLauncher.enable();
