// sqlTitleHandler.js
import type { IpcMain } from "electron";

export function registerSqlDescriptionHandlers(ipcMain: IpcMain) {
  // 🔹 Static SQL descriptions
  const sqlDescriptions: Record<
  string,
  { id: string; description: string; columns: string[] }
> = {
  "query_test_1.sql": {
    id: "q1",
    description: 
      "This query retrieves daily performance data. " +
      "You can edit the following columns to filter or adjust the report output:\n" +
      "- Date: specify the day for which you want to view metrics.\n" +
      "- NSU (New Signups): modify to focus on a specific number or range.\n" +
      "- FTD (First-Time Deposits): adjust to see deposits from new users.\n" +
      "- ConversionRate: see the percentage of signups that resulted in deposits.",
    columns: ["Date", "NSU", "FTD", "ConversionRate"],
  },
  "query_test_2.sql": {
    id: "q2",
    description:
      "This query aggregates monthly performance metrics. " +
      "You can change these columns to customize the monthly report:\n" +
      "- Month: select the specific month or period.\n" +
      "- Revenue: adjust or filter the total revenue column.\n" +
      "- ChurnRate: view or calculate the percentage of users lost.\n" +
      "- ActiveUsers: see only specific active user counts based on your selection.",
    columns: ["Month", "Revenue", "ChurnRate", "ActiveUsers"],
  },
};


  ipcMain.handle("sql:getDescription", async (_event: any, sql_name: string) => {
    try {
      const entry = sqlDescriptions[sql_name];
      if (!entry) {
        return {
          success: false,
          error: `No description found for ${sql_name}`,
        };
      }

      return {
        success: true,
        title: sql_name,
        description: entry.description,
        id: entry.id,
        columns: entry.columns,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Unknown error" };
    }
  });
}
