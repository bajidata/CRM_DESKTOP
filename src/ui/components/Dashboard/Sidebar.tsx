import React from "react";
import { Folder, LogOut } from "lucide-react";
import type { TabConfig } from "../types";

interface SidebarProps {
  isRequesting: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabNames: TabConfig;
  onLogout: () => void;
  projects: { gid: string; name: string }[]; // from Dashboard
  selectedProject: string | null;
  setSelectedProject: (gid: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isRequesting,
  activeTab,
  setActiveTab,
  tabNames,
  onLogout,
  projects,
  selectedProject,
  setSelectedProject,
}) => {
  return (
    <aside className="w-[15rem] bg-white shadow-lg flex flex-col">
      {/* CRM Header */}
      <div className="p-6 text-3xl font-bold border-b text-[#0c865e]">CRM</div>

      {/* Static Tabs */}
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {Object.keys(tabNames).map((tab) => (
          <button
            key={tab}
            className={`flex items-center w-full text-left px-4 py-2 rounded focus:outline-none ${
              activeTab === tab
                ? "bg-[#0c865e] text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
            disabled={isRequesting}
            aria-selected={activeTab === tab}
            role="tab"
          >
            <span className="mr-2">{tabNames[tab].icon}</span>
            {tabNames[tab].label}
          </button>
        ))}
        {/* Separator */}
        <hr className="my-4 border-t border-gray-300" />{" "}
        {/* Added separator here */}
        {/* Projects Section */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Asana Projects
          </h3>
          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">No projects available</p>
            ) : (
              projects.map((p) => (
                <button
                  key={p.gid}
                  onClick={() => setSelectedProject(p.gid)}
                  disabled={isRequesting}
                  className={`flex items-center w-full text-left px-3 py-2 rounded focus:outline-none ${
                    selectedProject === p.gid
                      ? "bg-[#0c865e] text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-selected={selectedProject === p.gid}
                  role="tab"
                >
                  <Folder
                    className={`w-6 h-6 mr-2 ${
                      selectedProject === p.gid
                        ? "text-white"
                        : "text-[#0c865e]"
                    } flex-shrink-0`}
                  />
                  <span className="whitespace-normal break-words">
                    {p.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full py-2 flex items-center justify-center gap-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          disabled={isRequesting}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
