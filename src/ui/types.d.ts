import type { Section } from "./types";

export {};

declare global {
  interface Window {
    electron?: {
      // 🔹 Auth
      sendToken: (token: string) => Promise<{
        success: boolean;
        uid?: string;
        name?: string;
        email?: string;
        photoURL?: string;
        role?: string;
        error?: string;
      }>;

      onAuthStatus: (callback: (data: any) => void) => void;
      onceAuthStatus: (callback: (data: any) => void) => void;

      // 🔹 SQL Management
      getBrands: () => Promise<{
        success: boolean;
        brands?: string[];
        error?: string;
      }>;
      getFiles: (
        brand: string
      ) => Promise<{ success: boolean; files?: string[]; error?: string }>;
      getFileContent: (
        brand: string,
        file: string
      ) => Promise<{ success: boolean; content?: string; error?: string }>;

      saveFileContent: (
        brand: string,
        file: string,
        content: string
      ) => Promise<{
        success: boolean;
        type?: string;
        title?: string;
        data?: any[];
        csv_link?: string;
        columns?: any[];
        error?: string;
      }>;

      getCredentials: () => Promise<{
        success: boolean;
        credentials?: { username: string; password: string };
        error?: string;
      }>;

      saveCredentials: (creds: {
        username: string;
        password: string;
      }) => Promise<{ success: boolean; error?: string }>;

      getSqlByDescription: (
        sql_title: string
      ) => Promise<{
        columns: never[];
        success: boolean;
        title: string;
        error?: string;
        description: string;
      }>;

      // 🔹 Asana tasks
      getAsanaTasks: (projectGid: string, role: string) => Promise<{
        success: boolean;
        sections?: Section[];
        error?: string;
      }>;

      // 🔹 Asana projects
      getAsanaProjects: () => Promise<{
        success: boolean;
        projects?: { gid: string; name: string }[];
        error?: string;
      }>;

      // 🔹 Superset CSV download
      downloadCsv: (
        csvId: string
      ) => Promise<{ success: boolean; filePath?: string; error?: string }>;

    };
  }
}
