export const fileSystemAPI = {
    readDir: (path) => window.electron.invoke("fs:readDir", path),
    readFile: (path) => window.electron.invoke("fs:readFile", path),
    writeFile: (path, content) => window.electron.invoke("fs:writeFile", { path, content }),
};
