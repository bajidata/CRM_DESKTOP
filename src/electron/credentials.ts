import fs from "fs";
import path from "path";
import type { IpcMain } from "electron";
import { getWritableDir } from "./resources.js";

function getCredentialsPath() {
  return path.join(getWritableDir("session"), "credentials.json");
}

export function registerCredentialHandlers(ipcMain: IpcMain) {
  ipcMain.handle("credentials:get", async () => {
    const credPath = getCredentialsPath();
    if (fs.existsSync(credPath)) {
      return {
        success: true,
        credentials: JSON.parse(fs.readFileSync(credPath, "utf-8")),
      };
    }
    return { success: false, error: "No credentials saved" };
  });

  ipcMain.handle("credentials:update", async (_event, creds) => {
    const credPath = getCredentialsPath();
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify(creds, null, 2));
    return { success: true };
  });
}
