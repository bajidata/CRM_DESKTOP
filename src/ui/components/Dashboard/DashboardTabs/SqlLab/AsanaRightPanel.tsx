// src/renderer/components/SqlLab/AsanaRightPanel.tsx
import React from "react";
import { ResultPanel } from "./ResultPanel";
import DescriptionPreview from "./Description";
import type { VpnInfo, Description } from "../../../types";

interface AsanaRightPanelProps {
  activeTabRight: string;
  setActiveTabRight: (tab: string) => void;
  isRequesting: boolean;
  tableData: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  // onCredentials: () => void;
  showSupersetError: VpnInfo;
  scriptDescription: Description;
  taskInfo: any;
  csvId: string;
}

export const AsanaRightPanel: React.FC<AsanaRightPanelProps> = ({
  activeTabRight,
  setActiveTabRight,
  isRequesting,
  tableData,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
//   onCredentials,
  showSupersetError,
  scriptDescription,
  taskInfo,
  csvId
}) => {
  return (
    <div className="col-span-3 flex flex-col bg-white rounded-lg shadow-md font-mono text-sm">
      <div className="flex-1 max-h-[80vh] overflow-y-auto">
        {activeTabRight === "result" && (
          <ResultPanel
            activeTabRight={activeTabRight}
            setActiveTabRight={setActiveTabRight}
            isRequesting={isRequesting}
            tableData={tableData}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={onPageChange}
            showSupersetError={showSupersetError}
            csvId={csvId}
          />
        )}

        {activeTabRight === "description" && (
          <DescriptionPreview
            activeTabRight={activeTabRight}
            setActiveTabRight={setActiveTabRight}
            isRequesting={isRequesting}
            description={scriptDescription.description}
            columns={scriptDescription.columns}
            taskInfo={taskInfo}
          />
        )}

        {/* {showSupersetError?.text && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            <strong>{showSupersetError.title}</strong>: {showSupersetError.text}
          </div>
        )} */}
      </div>
    </div>
  );
};

AsanaRightPanel.displayName = "AsanaRightPanel";
