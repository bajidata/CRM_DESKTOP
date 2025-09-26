// src/renderer/types/index.ts
import React from "react";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
}

export interface DashboardProps {
  user: User;
  setUser: (u: User | null) => void;
}

export interface CrendentialInfo {
  visible: boolean;
  username: string;
  password: string;
}

export interface VpnInfo {
  title: string;
  text: string;
}

export interface Description {
  columns: string[];
  description: string;
}

export interface SqlSegment {
  text: string;
  editable?: boolean;
  value?: string;
  label: string;
}

export interface SqlFile {
  name: string;
  content: string;
  parsedSegments: SqlSegment[];
}

export interface TabConfig {
  [key: string]: {
    label: string;
    icon: React.ReactNode;
  };
}

// ---------------------- Asana SQL Types ----------------------
export interface InputField {
  name: string;
  default: string;
  type: "text" | "date" | "datetime" | "select";
  options?: string[];
}

export interface ParsedSql {
  editable_contents?: Record<string, string>;
  supported_values?: Record<string, string[]>;
  template_script: string;
}

export interface LatestSql {
  gid: string;
  created_at: string;
  created_by: string;
  parsed_sql: ParsedSql;
}

export interface Identity {
  brand?: string;
  currency?: string | null;
}

export interface Task {
  csv_link: string;
  assignee: {
    gid: string | null;
    name: string | null;
    resource_type: string | null;
  };
  gid: string;
  name: string;
  notes: string;
  identity: {
    brand?: string;
    currency?: string | null;
    requestor?: string | null;
  };
  created_by?: {
    gid: string;
    name: string;
  };
  latest_sql?: {
    gid: string;
    created_at: string;
    created_by: string;
    parsed_sql: {
      editable_contents?: Record<string, string>;
      supported_values?: Record<string, string[]>;
      template_script: string;
    };
  };
  inputs?: InputField[];
}

export interface Section {
  section_name: string;
  section_gid: string;
  task_count: number;
  tasks: Task[];
}

export interface ExecutionResult {
  success: boolean;
  data?: any[];
  title?: string;
  error?: any;
  type?: string;
}

// Define a type for the assignee
export interface Assignee {
  gid: string;
  name: string;
  resource_type: string;
  script_author: string;
  requestor: string
}
// export interface InputField {
//   name: string;
//   default: string;
//   type: "text" | "date" | "datetime" | "select";
//   options?: string[];
// }
