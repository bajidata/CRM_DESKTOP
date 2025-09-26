// import React from "react";
// import type { SqlFile } from "../../../types";
// import { SqlPreview } from "./SqlPreview";
// import { ResultPanel } from "./ResultPanel";
// import DescriptionPreview from "./Description";
// // import StatusCard from "./StatusCard";
// interface SqlRightPanelProps {
//   activeTabRight: string;
//   setActiveTabRight: (tab: string) => void;
//   sqlFiles: SqlFile[];
//   isRequesting: boolean;
//   // elapsedMs: number;
//   tableData: any[];
//   // dbName: string;
//   currentPage: number;
//   totalPages: number;
//   pageSize: number;
//   onPageChange: (page: number) => void;
//   onCredentials: () => void;
//   showSupersetError: { title: string; text: string };
//   scriptDescription: { columns: string[]; description: string };
//   taskInfo: {gid: string, name:string, resource_type:string}
// }

// export const SqlRightPanel: React.FC<SqlRightPanelProps> = ({
//   activeTabRight,
//   setActiveTabRight,
//   sqlFiles,
//   isRequesting,
//   // elapsedMs,
//   tableData,
//   // dbName,
//   currentPage,
//   totalPages,
//   pageSize,
//   onPageChange,
//   // onCredentials,
//   showSupersetError,
//   scriptDescription,
//   taskInfo
// }) => {
//   return (
//     <div className="col-span-3 flex flex-col bg-white rounded-lg shadow-md font-mono text-sm">
//       <div className="flex-1 max-h-[80vh] overflow-y-auto">
//         {/* // Completed state with final time */}
//         {activeTabRight === "sql" && <SqlPreview sqlFiles={sqlFiles} />}
//         {activeTabRight === "result" && (
//           <ResultPanel
//             activeTabRight={activeTabRight}
//             setActiveTabRight={setActiveTabRight}
//             isRequesting={isRequesting}
//             // elapsedMs={elapsedMs}
//             tableData={tableData}
//             // dbName={dbName}
//             currentPage={currentPage}
//             totalPages={totalPages}
//             pageSize={pageSize}
//             onPageChange={onPageChange}
//             showSupersetError={showSupersetError}
//           />
//         )}
//         {activeTabRight === "description" && (
//           <DescriptionPreview
//             activeTabRight={activeTabRight}
//             setActiveTabRight={setActiveTabRight}
//             isRequesting={isRequesting}
//             description={scriptDescription.description}
//             columns={scriptDescription.columns}
//             taskInfo={taskInfo}
//           />
//         )}
//       </div>
//     </div>
//   );
// };
