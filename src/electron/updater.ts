//import { autoUpdater } from "electron-updater";
import { BrowserWindow, dialog } from "electron";
import pkg from "electron-updater";
const { autoUpdater } = pkg;

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update:available", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update:none");
  });

  autoUpdater.on("error", (err) => {
    dialog.showErrorBox("Update Error", err?.stack || err.toString());
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("update:progress", progress.percent);
  });

  autoUpdater.on("update-downloaded", (info) => {
    dialog
      .showMessageBox({
        type: "question",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
        cancelId: 1,
        title: "Update Ready",
        message: `Version ${info.version} has been downloaded. Restart now?`,
      })
      .then((res) => {
        if (res.response === 0) autoUpdater.quitAndInstall();
      });
  });

  
}
