import fs from "fs";
import path from "path";
import axios from "axios";
import { IpcMain, app } from "electron";
import { chromium, Page, Browser, Locator } from "playwright-core";
import { getWritableDir } from "./resources.js";
import { isDev } from "./util.js";
import https from "https";
import { getSupersetCredentials } from "./auth.js";

// ==================================================
// Paths & Helpers
// ==================================================
function getSqlBaseDir() {
  return isDev()
    ? path.join(process.cwd(), "dist-electron", "sql")
    : getWritableDir("sql");
}

function getSessionBaseDir() {
  return isDev()
    ? path.join(process.cwd(), "dist-electron", "session")
    : getWritableDir("session");
}

function getCredentialsPath() {
  return path.join(getSessionBaseDir(), "credentials.json");
}

function getChromiumExecutablePath() {
  const base = path.join(process.resourcesPath, "chromium", "chrome-win");
  const devBase = path.join(
    process.cwd(),
    "dist-electron",
    "chromium",
    "chrome-win"
  );

  const exePath =
    process.env.NODE_ENV === "development"
      ? path.join(devBase, "chrome.exe")
      : path.join(base, "chrome.exe");

  if (!fs.existsSync(exePath)) {
    throw new Error(`Chromium not found at ${exePath}`);
  }
  return exePath;
}

function ensureFileCopied(subdir: string, brand: string, file: string) {
  const userDir = getWritableDir(path.join(subdir, brand));
  const userPath = path.join(userDir, file);

  if (!fs.existsSync(userPath)) {
    const resourcePath = isDev()
      ? path.join(process.cwd(), "dist-electron", subdir, brand, file)
      : path.join(process.resourcesPath, subdir, brand, file);

    if (fs.existsSync(resourcePath)) {
      fs.copyFileSync(resourcePath, userPath);
    }
  }

  return userPath;
}

function checkSiteReachable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        resolve(res.statusCode! >= 200 && res.statusCode! < 400);
      })
      .on("error", () => resolve(false));
  });
}

// ==================================================
// Asana Axios Helpers + Cache
// ==================================================
const ASANA_ACCESS_TOKEN =
  "2/1207986152477905/1211255467312096:7bff2c6868b77ee35049b98f5349e280";
const BASE_URL = "https://app.asana.com/api/1.0";

const asanaAxios = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${ASANA_ACCESS_TOKEN}` },
});

// Simple in-memory cache (can be persisted to file if needed)
const asanaCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (adjust as needed)

let currentRole: string | null = null;

async function asanaGet(endpoint: string, force = false) {
  const now = Date.now();
  const cached = asanaCache.get(endpoint);

  if (!force && cached && now - cached.ts < CACHE_TTL) {
    console.log(`Using cached Asana data for ${endpoint}`);
    return cached.data; // this should be already the unwrapped data
  }

  console.log(`Fetching fresh Asana data for ${endpoint}`);
  const res = await asanaAxios.get(endpoint);

  // Extract only the `data` array from Asana response
  const payload = res.data?.data || [];
  asanaCache.set(endpoint, { data: payload, ts: now });

  return payload; // <-- FIX: returning only the useful array
}

// ==================================================
// Cache Cleanup Job
// ==================================================
function cleanupAsanaCache() {
  const now = Date.now();
  let removed = 0;

  for (const [key, value] of asanaCache.entries()) {
    if (now - value.ts >= CACHE_TTL) {
      asanaCache.delete(key);
      removed++;
    }
  }

  if (removed > 0) {
    console.log(
      `Cache cleanup completed: removed ${removed} expired entries`
    );
  }
}

// Run cleanup every minute
setInterval(cleanupAsanaCache, 60 * 1000);

async function fetchAllProjects() {
  const projects = await asanaGet(`/projects`);
  console.log("Fetched Projects:", projects);
  return projects;
}

function parseIdentity(description: string) {
  const brandMatch = description.match(/Brand\s*Type:\s*(\w+)/i);
  const currencyMatch = description.match(/Currency\s*Type:\s*(\w+)/i);
  // Case-insensitive match for "Requestor:"
  const requestorMatch = description.match(/requestor:\s*(.+)/i);

  return {
    brand: brandMatch ? brandMatch[1] : null,
    currency: currencyMatch ? currencyMatch[1] : null,
    requestor: requestorMatch ? requestorMatch[1].trim() : null,
  };
}

function parseAsanaSqlComment(commentText: string) {
  const blocks = commentText.split(/\n\s*\n/);
  const data: any = {
    editable_contents: {},
    supported_values: {},
    template_script: "",
  };

  for (const block of blocks) {
    if (block.startsWith("Editable Contents:")) {
      block
        .split("\n")
        .slice(1)
        .forEach((line) => {
          const [key, value] = line.split(":").map((s) => s.trim());
          if (key && value) data.editable_contents[key] = value;
        });
    } else if (block.startsWith("List of Supported Values:")) {
      block
        .split("\n")
        .slice(1)
        .forEach((line) => {
          const [key, values] = line.split(":").map((s) => s.trim());
          if (key && values)
            data.supported_values[key] = values.split(",").map((v) => v.trim());
        });
    } else if (block.startsWith("Template Scripts:")) {
      const templateIndex = commentText.indexOf("Template Scripts:");
      if (templateIndex !== -1) {
        data.template_script = commentText
          .substring(templateIndex + "Template Scripts:".length)
          .trim();
      }
    }
  }

  return data.template_script ? data : null;
}

// function classifyInputFields(editable: any, supported: any) {
//   return Object.entries(editable).map(([name, value]) => {
//     if (/date/i.test(name)) return { name, default: value, type: "date" };
//     if (supported[name])
//       return { name, default: value, type: "select", options: supported[name] };
//     return { name, default: value, type: "text" };
//   });
// }

// new patched for timezone
function classifyInputFields(editable: any, supported: any) {
  console.log(supported);

  return Object.entries(editable).map(([name, value]) => {
    // Handle date fields
    if (/date/i.test(name)) {
      let type: "date" | "datetime" = "date";

      if (typeof value === "string") {
        console.log("-------------------------------------------------");
        console.log(value);
        // Match ISO or SQL-like date-time formats
        if (/\d{4}-\d{2}-\d{2}[T\s]\d{2}-\d{2}(-\d{2})?/.test(value)) {
          type = "datetime";
        }
      }

      return { name, default: value, type };
    }

    // Handle supported options
    if (supported[name] && supported[name].length > 1) {
      return { name, default: value, type: "select", options: supported[name] };
    }

    // Fallback to text if no supported options or only 1
    return { name, default: value, type: "text" };
  });
}

// ---------- Fetch latest SQL comment ----------
async function fetchLatestSqlComment(taskGid: string) {
  const stories = await asanaGet(`/tasks/${taskGid}/stories`);
  const sqlComments = stories
    .filter((s: any) => s.type === "comment")
    .map((s: any) => ({ ...s, parsed_sql: parseAsanaSqlComment(s.text) }))
    .filter((s: any) => s.parsed_sql);

  if (!sqlComments.length) return null;

  const pinned = sqlComments.filter((c: any) => c.is_pinned);
  const latest = pinned.length
    ? pinned[pinned.length - 1]
    : sqlComments[sqlComments.length - 1];

  return {
    gid: latest.gid,
    created_at: latest.created_at,
    created_by: latest.created_by.name,
    parsed_sql: latest.parsed_sql,
  };
}

// ---------- Fetch task details ----------
async function fetchTaskDetails(taskGid: string) {
  const task: any = await asanaGet(
    `/tasks/${taskGid}?opt_fields=name,created_by.name,created_by.gid,assignee.name,notes,custom_fields.name,custom_fields.enum_value,followers.name`
  );
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(task);
  console.log(
    "----------------------------------------------------------------"
  );
  const identity = parseIdentity(task.notes || "");
  const latest_sql = await fetchLatestSqlComment(taskGid);
  const inputs = latest_sql
    ? classifyInputFields(
        latest_sql.parsed_sql.editable_contents,
        latest_sql.parsed_sql.supported_values
      )
    : [];
  return { ...task, identity, latest_sql, inputs };
}

function clearAsanaCache() {
  asanaCache.clear();
  console.log("Asana cache cleared due to role change");
}

// ---------- Fetch section tasks (Concurrent) ----------
async function fetchSectionTasks(sectionGid: string, role: string) {
  // Detect role change and clear cache
  if (currentRole !== role) {
    clearAsanaCache();
    currentRole = role;
  }

  const tasks = await asanaGet(`/sections/${sectionGid}/tasks`);

  // Filter first to reduce network calls
  const normalizedRole = role.toLowerCase();

  let filteredTasks;
  if (normalizedRole === "analysis") {
    filteredTasks = tasks.filter((t: any) =>
      t.name.toLowerCase().includes("!crm !analysis")
    );
  } else if (normalizedRole === "bonus") {
    filteredTasks = tasks.filter((t: any) =>
      t.name.toLowerCase().includes("!crm !bonus")
    );
  } else {
    filteredTasks = tasks.filter((t: any) =>
      t.name.toLowerCase().includes("!crm")
    );
  }

  // Fetch details concurrently (limit concurrency if Asana rate-limits)
  const enriched = await Promise.all(
    filteredTasks.map(async (t: any) => {
      const details = await fetchTaskDetails(t.gid);
      return details.latest_sql ? details : null;
    })
  );

  return enriched.filter(Boolean);
}

// ---------- Fetch project structure (Concurrent) ----------
async function fetchProjectStructure(projectGid: string, role: string) {
  try {
    const sections = await asanaGet(`/projects/${projectGid}/sections`);
    if (sections.length === 0) return [];

    // Concurrent fetch of section tasks
    const sectionResults = await Promise.all(
      sections.map(async (section: any) => {
        const tasks = await fetchSectionTasks(section.gid, role);
        if (!tasks.length) return null;
        return {
          section_name: section.name,
          section_gid: section.gid,
          task_count: tasks.length,
          tasks,
        };
      })
    );

    return sectionResults.filter(Boolean);
  } catch (error) {
    console.error("Error fetching project structure:", error);
    return [];
  }
}

// ==================================================
// IPC Registration
// ==================================================
export function registerSqlHandlers(ipcMain: IpcMain) {
  // ---------- Brands not used ----------
  ipcMain.handle("sql:getBrands", async () => {
    try {
      const brands = fs
        .readdirSync(getSqlBaseDir(), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
      return { success: true, brands };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ---------- Files not used ----------
  ipcMain.handle("sql:getFiles", async (_event, brand: string) => {
    try {
      const brandDir = path.join(getSqlBaseDir(), brand);
      if (!fs.existsSync(brandDir)) throw new Error("Brand not found");
      const files = fs.readdirSync(brandDir).filter((f) => f.endsWith(".sql"));
      return { success: true, files };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ---------- File Content not used ----------
  ipcMain.handle(
    "sql:getFileContent",
    async (_event, brand: string, file: string) => {
      try {
        const filePath = ensureFileCopied("sql", brand, file);
        const content = fs.readFileSync(filePath, "utf-8");
        return { success: true, content };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
  );

  // ---------- Save & Run SQL ----------
  ipcMain.handle(
    "sql:runFile",
    async (_event, brand: string, file: string, content: string) => {
      let browser: Browser | undefined;
      let page: Page | undefined;
      let newTab: Locator | undefined;

      const sessionDir = getSessionBaseDir();
      fs.mkdirSync(sessionDir, { recursive: true });
      const storageStatePath = path.join(sessionDir, "auth.json");
      const metaPath = path.join(sessionDir, "auth_meta.json");
      const loginUrl = "https://ar0ytyts.superdv.com/login";

      try {
        // --- Get Firestore credential ---
        const creds = await getSupersetCredentials();
        const activeCred = creds.find((c: any) => c.status === true);
        if (!activeCred) {
          return {
            success: false,
            type: "credentials_required",
            error: "No active Superset credential found in Firestore",
          };
        }

        // --- VPN check ---
        const reachable = await checkSiteReachable(loginUrl);
        if (!reachable) {
          return {
            success: false,
            type: "vpn_error",
            error: "Site not reachable.",
          };
        }

        // --- Launch Playwright ---
        browser = await chromium.launch({
          headless: true,
          executablePath: getChromiumExecutablePath(),
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });

        // --- Determine if we can reuse existing session ---
        let lastUsername = "";
        if (fs.existsSync(metaPath)) {
          lastUsername = JSON.parse(
            fs.readFileSync(metaPath, "utf-8")
          ).username;
        }
        const useExistingSession =
          fs.existsSync(storageStatePath) &&
          lastUsername === activeCred.username;

        const context = useExistingSession
          ? await browser.newContext({ storageState: storageStatePath })
          : await browser.newContext();

        page = await context.newPage();
        await page.goto(loginUrl);

        // --- Login if session missing or username changed ---
        if (!useExistingSession) {
          console.log(`Logging in as ${activeCred.username}`);
          await page.fill("#username", activeCred.username);
          await page.fill("#password", activeCred.password);
          await Promise.all([
            page.waitForURL(/.*\/superset\/(welcome|dashboard).*/, {
              timeout: 15000,
            }),
            page.click('input[type="submit"][value="Sign In"]'),
          ]);

          // Save session + who owns it
          await context.storageState({ path: storageStatePath });
          fs.writeFileSync(
            metaPath,
            JSON.stringify({ username: activeCred.username })
          );
        } else {
          console.log(`Reusing existing session for ${activeCred.username}`);
        }

        // --- SQL Lab ---
        await page.goto("https://ar0ytyts.superdv.com/superset/sqllab");

        await page.click("button.ant-tabs-nav-add", { force: true });
        await page.waitForTimeout(2000);

        newTab = page.locator(
          ".ant-tabs-tab.ant-tabs-tab-active:has(button.ant-tabs-tab-remove)"
        );
        await newTab.waitFor();

        // --- Inject SQL into Ace ---
        await page.waitForSelector("#ace-editor");
        await page.click("#ace-editor");
        await page.keyboard.press("Control+A");
        await page.keyboard.press("Backspace");

        const sanitizedSQL = content.replace(/\{\{|\}\}/g, "");
        await page.evaluate((sql: string) => {
          const editor = (window as any).ace.edit("ace-editor");
          editor.setValue(sql, -1);
        }, sanitizedSQL);

        // --- Set LIMIT dropdown (optional) ---
        try {
          await page.click("a.ant-dropdown-trigger");
          const limitOption = page
            .locator('li.ant-dropdown-menu-item:has-text("1 000 000")')
            .first();
          await limitOption.waitFor({ state: "visible", timeout: 5000 });
          await limitOption.click();
        } catch (err) {
          console.warn("Failed to set LIMIT dropdown:", (err as Error).message);
        }

        // Small delay to give the UI time to apply the new selection
        await page.waitForTimeout(3000); // 0.5s delay, adjust if needed

        // --- Run SQL ---
        const runButton = page.locator("button.superset-button.cta", {
          hasText: /Run/i,
        });
        await runButton.waitFor({ state: "visible", timeout: 10000 });

        let resolved = false;
        const sqlResult = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("SQL query timed out")),
            60000
          );

          page?.on("response", async (response) => {
            if (resolved) return;
            if (response.url().includes("/superset/sql_json/")) {
              resolved = true;
              clearTimeout(timeout);
              const body = await response.json();
              if (response.status() === 200) {
                if (body.error) reject(new Error(`Query Error: ${body.error}`));
                else resolve(body);
              } else if (
                response.status() === 403 ||
                response.status() === 500
              ) {
                // Return structured error instead of stringified JSON
                reject({ type: "forbidden", body });
              } else {
                reject(
                  new Error(
                    `SQL request failed with status ${response.status()}`
                  )
                );
              }
            }
          });

          runButton.click({ force: true }).catch(reject);
        });

        return {
          success: true,
          type: "success",
          title: sqlResult?.query?.db || "No Database",
          data: sqlResult?.data?.length ? sqlResult.data : [],
          csv_link: sqlResult?.query?.id || "",
          columns: sqlResult?.columns?.length ? sqlResult.columns : [],
          sessionPath: storageStatePath,
        };
      } catch (err: any) {
        if (err?.body) {
          return {
            success: false,
            type: "superset_error",
            error: err.body, // full Superset response here
          };
        }

        return { success: false, type: "auth_error", error: err.message };
      } finally {
        try {
          if (newTab) {
            const closeBtn = newTab.locator("button.ant-tabs-tab-remove");
            await closeBtn.click();
          }
          if (browser) {
            await browser.close();
          }
        } catch {
          // ignore cleanup errors
        }
      }
    }
  );

  // ---------- Save & Download CSV ----------
  ipcMain.handle("superset:downloadCsv", async (_event, csvId: string) => {
    let browser: Browser | undefined;

    const sessionDir = getSessionBaseDir();
    fs.mkdirSync(sessionDir, { recursive: true });
    const storageStatePath = path.join(sessionDir, "auth.json");
    const metaPath = path.join(sessionDir, "auth_meta.json");
    const loginUrl = "https://ar0ytyts.superdv.com/login";

    try {
      // --- Get Superset credentials ---
      const creds = await getSupersetCredentials();
      const activeCred = creds.find((c: any) => c.status === true);
      if (!activeCred)
        return { success: false, error: "No active Superset credential found" };

      // --- Launch Playwright ---
      browser = await chromium.launch({
        headless: true,
        executablePath: getChromiumExecutablePath(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });

      // --- Reuse session if available ---
      let lastUsername = "";
      if (fs.existsSync(metaPath))
        lastUsername = JSON.parse(fs.readFileSync(metaPath, "utf-8")).username;
      const useExistingSession =
        fs.existsSync(storageStatePath) && lastUsername === activeCred.username;
      const context = useExistingSession
        ? await browser.newContext({ storageState: storageStatePath })
        : await browser.newContext();

      const page = await context.newPage();
      await page.goto(loginUrl);

      // --- Login if no valid session ---
      if (!useExistingSession) {
        await page.fill("#username", activeCred.username);
        await page.fill("#password", activeCred.password);
        await Promise.all([
          page.waitForURL(/.*\/superset\/(welcome|dashboard).*/, {
            timeout: 15000,
          }),
          page.click('input[type="submit"][value="Sign In"]'),
        ]);

        // Save session
        await context.storageState({ path: storageStatePath });
        fs.writeFileSync(
          metaPath,
          JSON.stringify({ username: activeCred.username })
        );
      }

      // --- Download CSV using authenticated session ---
      const csvUrl = `https://ar0ytyts.superdv.com/superset/csv/${csvId}`;
      const response = await context.request.get(csvUrl, {
        timeout: 180_000,
      });
      if (!response.ok())
        throw new Error(`Failed to download CSV. Status: ${response.status()}`);
      const buffer = await response.body();

      // --- Save to user's real Downloads folder ---
      const downloadsDir = app.getPath("downloads"); // OS default Downloads folder
      const filePath = path.join(downloadsDir, `CRM-Report-${Date.now()}.csv`);
      fs.writeFileSync(filePath, buffer);

      // --- Open file with default app (Excel, Numbers, etc.) ---
      // await shell.openPath(filePath);

      return { success: true, filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      if (browser) await browser.close();
    }
  });

  // ---------- Fetch From Asana ----------
  ipcMain.handle(
    "sql:getFromAsana",
    async (_event, projectGid: string, role: string) => {
      try {
        const data = await fetchProjectStructure(projectGid, role);
        return { success: true, sections: data };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
  );

  // ---------- Projects ----------
  ipcMain.handle("sql:getProjects", async () => {
    try {
      const projects = await fetchAllProjects();
      // normalize output if you don’t want the whole Asana object
      const normalized = projects.map((p: any) => ({
        gid: p.gid,
        name: p.name,
      }));
      return { success: true, projects: normalized };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
