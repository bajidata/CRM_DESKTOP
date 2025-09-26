// types.ts
export interface SupersetCredential {
  id: string;
  username: string;
  password: string;
  status: boolean;
}

export interface EditableContents {
  [key: string]: string;
}

export interface SupportedValues {
  [key: string]: string[];
}

export interface ParsedSQL {
  editable_contents: EditableContents;
  supported_values: SupportedValues;
  template_script: string;
}

export interface LatestSQL {
  gid: string;
  created_at: string;
  created_by: string;
  parsed_sql: ParsedSQL;
}

export interface Task {
  gid: string;
  title: string;
  description: string;
  identity: { brand: string | null; currency: string | null };
  latest_sql: LatestSQL | null;
}

export interface Section {
  section_name: string;
  section_gid: string;
  task_count: number;
  tasks: Task[];
}

export interface InputField {
  name: string;
  default: string;
  type: "date" | "select" | "text";
  options?: string[];
}
