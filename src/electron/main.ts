import { app, BrowserWindow, ipcMain, globalShortcut, screen } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

import { registerAuthHandlers } from "./auth.js";
import { registerSqlHandlers } from "./sql.js";
import { registerCredentialHandlers } from "./credentials.js";
import { setupAutoUpdater } from "./updater.js";
import { bootstrapResources } from "./resources.js";
// import { registerSqlDescriptionHandlers } from "./sqlDescription.js";
import { fetchAsanaProjects, AsanaProject } from "./asana.js";

app.on("ready", async () => {
  const display = screen.getPrimaryDisplay();
  const scaleFactor = display.scaleFactor; // e.g. 1, 1.25, 1.5, 2
  // console.log(scaleFactor)
  bootstrapResources();

  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: getPreloadPath(),
      devTools: isDev(), // disable DevTools in production
      // zoomFactor: 2, // adjust this to scale UI
    },
  });

  // Apply scaling so UI looks the same on all resolutions
  mainWindow.webContents.setZoomFactor(scaleFactor);

  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5174");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));

    // Prevent DevTools opening in production
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });

    // Block DevTools shortcuts
    app.on("browser-window-focus", () => {
      globalShortcut.register("CommandOrControl+Shift+I", () => false);
      globalShortcut.register("F12", () => false);
    });

    app.on("browser-window-blur", () => {
      globalShortcut.unregisterAll();
    });
  }

  // Fetch Asana projects automatically (no UI trigger needed)
  try {
    const projects: AsanaProject[] = await fetchAsanaProjects();
    console.log("Asana Projects:", projects);

    // Optionally send them to renderer once window is ready
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("asana:projects-ready", projects);
    });
  } catch (err: any) {
    console.error("Failed to fetch Asana projects:", err.message);
  }

  setupAutoUpdater(mainWindow); // forward updater events to window instead of blocking dialogs

  // --- Register IPC handlers ---
  registerAuthHandlers(ipcMain);
  registerSqlHandlers(ipcMain);
  registerCredentialHandlers(ipcMain);
  // registerSqlDescriptionHandlers(ipcMain);
});


