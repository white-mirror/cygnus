const path = require("path");
const { app, BrowserWindow } = require("electron");

const getRendererEntry = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app", "dist", "index.html");
  }
  return path.resolve(__dirname, "../frontend-web/dist/index.html");
};

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  const entryFile = getRendererEntry();
  window.loadFile(entryFile);
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
