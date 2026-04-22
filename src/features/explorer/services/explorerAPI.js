// features/explorer/services/explorerAPI.js
export const explorerAPI = {
    openFolder: () => window.electron.invoke("explorer:openFolder"),
};
