export const simulationAPI = {
    startCommand: (payload) => window.electron.invoke("simulation:startCommand", payload),
    startQueue: (payload) => window.electron.invoke("simulation:startQueue", payload),
    getLatest: () => window.electron.invoke("simulation:getLatest"),
    stop: (payload) => window.electron.invoke("simulation:stop", payload),
};
