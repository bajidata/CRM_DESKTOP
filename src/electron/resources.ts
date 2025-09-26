import fs from "fs";
import path from "path";
import { app } from "electron";
import { isDev } from "./util.js";

export function bootstrapResources() {
  const resources = ["sql", "session", "config"];
  resources.forEach((subdir) => {
    const sourceDir = isDev()
      ? path.join(app.getAppPath(), "dist-electron", subdir)
      : path.join(process.resourcesPath, subdir);

    const targetDir = getWritableDir(subdir);

    if (fs.existsSync(sourceDir)) {
      fs.readdirSync(sourceDir, { withFileTypes: true }).forEach((entry) => {
        const srcPath = path.join(sourceDir, entry.name);
        const destPath = path.join(targetDir, entry.name);

        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          fs.cpSync(srcPath, destPath, { recursive: true, force: false });
        } else if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    }
  });
}

export function getWritableDir(subdir: string) {
  const dir = path.join(app.getPath("userData"), subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
