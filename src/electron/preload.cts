import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getTestData: () => console.log("static test..."),

  sendToken: (token: string) => ipcRenderer.invoke("auth:verify", token),
  onAuthStatus: (callback: (data: any) => void) => {
    ipcRenderer.on("auth-status", (_event, data) => callback(data));
  },
  onceAuthStatus: (callback: (data: any) => void) => {
    ipcRenderer.once("auth-status", (_event, data) => callback(data));
  },

  // SQL file management
  getBrands: () => ipcRenderer.invoke("sql:getBrands"),
  getFiles: (brand: string) => ipcRenderer.invoke("sql:getFiles", brand),
  getFileContent: (brand: string, file: string) =>
    ipcRenderer.invoke("sql:getFileContent", brand, file),
  saveFileContent: (brand: string, file: string, content: string) =>
    ipcRenderer.invoke("sql:runFile", brand, file, content),

  // 🔹 Credentials popup
  // openCredentialPopup: () => ipcRenderer.invoke("creds:open"),
  saveCredentials: (creds: { username: string; password: string }) =>
    ipcRenderer.invoke("credentials:update", creds),
  getCredentials: () => ipcRenderer.invoke("credentials:get"),

  //get scripts descriptions
  getSqlByDescription: (sql_title: string) =>
    ipcRenderer.invoke("sql:getDescription", sql_title),

  // 🔹 NEW: Fetch Asana tasks
  getAsanaTasks: (projectGid: string, role: string) =>
    ipcRenderer.invoke("sql:getFromAsana", projectGid, role),

  getAsanaProjects: () => ipcRenderer.invoke("sql:getProjects"),

  // 🔹 NEW: Superset CSV download
  downloadCsv: (brand: string, csvId: string) =>
    ipcRenderer.invoke("superset:downloadCsv", brand,csvId),
});
