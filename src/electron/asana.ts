// asana.ts
import axios from "axios";

export interface AsanaProject {
  gid: string;
  name: string;
  resource_type: string;
}

export async function fetchAsanaProjects(): Promise<AsanaProject[]> {
//   const token = process.env.ASANA_TOKEN;
  const token = "2/1207986152477905/1211255467312096:7bff2c6868b77ee35049b98f5349e280";
  if (!token) throw new Error("Missing ASANA_TOKEN in environment");

  const response = await axios.get("https://app.asana.com/api/1.0/projects", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data as AsanaProject[];
}
