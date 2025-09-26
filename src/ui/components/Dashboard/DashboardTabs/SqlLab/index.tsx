// import React, { useState, useEffect, useCallback, memo, useRef } from "react";
// import { useBrandsAndFiles } from "../../../hooks/useBrandsAndFiles";
// import { useSqlFiles } from "../../../hooks/useSqlFiles";
// // import { useTimer } from "../../../hooks/useTimer";
// import { SqlLeftPanel } from "./SqlLeftPanel";
// import { SqlRightPanel } from "./SqlRightPanel";
// // import VpnPopup from "../../../VpnPopup";
// import type { Description, VpnInfo } from "../../../types";
// import {
//   handleExecutionError,
//   type ExecutionResult,
// } from "../../../utils/errorHandlers";
// import { getDefaultValue } from "../../../utils/sqlParser";

// interface SqlLabProps {
//   isRequesting: boolean;
//   setIsRequesting: (arg: boolean) => void;
//   onCredentials: () => void;
// }

// export const SqlLab: React.FC<SqlLabProps> = memo(
//   ({ isRequesting, setIsRequesting, onCredentials }) => {
    
//     const [activeTabRight, setActiveTabRight] = useState("description");
//     const [tableData, setTableData] = useState<any[]>([]);
//     // const [dbName, setDbName] = useState("No Database");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [inputValues, setInputValues] = useState<Record<string, string>>({});
//     // const [showVpn, setShowVpn] = useState(false);
//     const [showVpnInfo, setShowVpnInfo] = useState<VpnInfo>({
//       title: "",
//       text: "",
//     });
//     const [scriptDescription, setScriptDescription] = useState<Description>({
//       columns: [],
//       description: "",
//     });

//     const pageSize = 20;

//     // const { startTimer, stopTimer, resetTimer } = useTimer();
//     const {
//       brands,
//       files,
//       selectedBrand,
//       selectedFile,
//       handleBrandChange,
//       handleFileChange,
//     } = useBrandsAndFiles();
//     const { sqlFiles, loadFileContent, updatePlaceholder } = useSqlFiles();

//     const totalPages = Math.ceil(tableData.length / pageSize);
//     const pendingUpdatesRef = useRef<Record<string, string>>({});
//     const sqlFilesRef = useRef(sqlFiles);
//     const inputValuesRef = useRef(inputValues);

//     // Keep refs updated
//     useEffect(() => {
//       sqlFilesRef.current = sqlFiles;
//       inputValuesRef.current = inputValues;
//     }, [sqlFiles, inputValues]);

//     // Initialize input values when sqlFiles changes
//     useEffect(() => {
//       if (sqlFiles.length > 0) {
//         const newValues: Record<string, string> = {};
//         sqlFiles[0].parsedSegments.forEach((seg) => {
//           if (seg.editable && seg.value) {
//             // Only initialize if not already set
//             if (!(seg.value in inputValuesRef.current)) {
//               const initValue = getDefaultValue(seg.value);
//               newValues[seg.value] = initValue !== "" ? initValue : seg.value; // start empty if no default
//               // newValues[seg.value] = "";
//             }
//           }
//         });

//         if (Object.keys(newValues).length > 0) {
//           setInputValues((prev) => ({ ...prev, ...newValues }));
//         }
//       }
//     }, [sqlFiles]);

//     // Handle placeholder changes without causing re-renders
//     const handlePlaceholderChange = useCallback(
//       (placeholderKey: string, value: string) => {
//         // Update local state immediately for responsive UI
//         setInputValues((prev) => ({ ...prev, [placeholderKey]: value }));

//         // Store the update but don't apply it to SQL content yet
//         pendingUpdatesRef.current[placeholderKey] = value;
//       },
//       []
//     );

//     // Apply all pending updates to SQL content (called before execution)
//     // const applyPendingUpdates = useCallback(() => {
//     //   const updates = { ...pendingUpdatesRef.current };
//     //   pendingUpdatesRef.current = {};

//     //   Object.entries(updates).forEach(([key, value]) => {
//     //     updatePlaceholder(key, value);
//     //   });
//     // }, [updatePlaceholder]);

//     // Handle execution success
//     const handleExecutionSuccess = useCallback((result: any) => {
//       // setShowVpn(false);

//       // setDbName(result?.dbName)
//       console.log(result?.title);
//       setTableData(result?.data || []);
//       // setDbName(result?.title || "No Database");
//     }, []);

//     // Handle execution error
//     const handleExecutionErrorResult = useCallback(
//       (result: ExecutionResult) => {
//         const { vpnInfo } =
//           handleExecutionError(result);

//         let safeError: string = "Unknown error";

//         if (typeof result.error === "string") {
//           safeError = result.error;
//         } else if (result.error?.errors) {
//           safeError = result.error.errors
//             .map((e: any) => e.message || JSON.stringify(e))
//             .join("; ");
//         } else {
//           safeError = JSON.stringify(result.error);
//         }

//         setShowVpnInfo({
//           ...vpnInfo,
//           text: typeof vpnInfo?.text === "string" ? vpnInfo.text : safeError,
//         });
//         // setShowVpn(shouldShowVpn);

//         console.error("Execution failed:", safeError);
//         // console.log(showVpnInfo)
//         return {
//           ...vpnInfo,
//           text: typeof vpnInfo?.text === "string" ? vpnInfo.text : safeError,
//         };
//       },
//       []
//     );

//     const handleExecute = useCallback(async () => {
//       if (!selectedBrand || !selectedFile || sqlFilesRef.current.length === 0)
//         return;

//       // Merge pending updates into inputValuesRef
//       const updates = { ...pendingUpdatesRef.current };
//       pendingUpdatesRef.current = {};

//       Object.entries(updates).forEach(([key, value]) => {
//         inputValuesRef.current[key] = value; // persist into ref
//         // updatePlaceholder(key, value); // sync UI if needed
//       });

//       // Always start from the original template
//       let sqlContent = sqlFilesRef.current[0].content;

//       // Replace with current values (not just latest changes)
//       Object.entries(inputValuesRef.current).forEach(([key, value]) => {
//         sqlContent = sqlContent.replaceAll(`{{${key}}}`, value);
//       });

//       // resetTimer();
//       setIsRequesting(true);
//       setTableData([]); // clear old data before request
//       setCurrentPage(1);
//       setShowVpnInfo({
//         title: "",
//         text: "",
//       });
//       // startTimer();

//       try {
//         const res = await window.electron?.saveFileContent(
//           selectedBrand,
//           selectedFile,
//           sqlContent
//         );

//         // stopTimer();
//         setIsRequesting(false);
//         // setTableData([]);
//         setActiveTabRight("result");

//         if (res?.success) {
//           handleExecutionSuccess(res);
//         } else {
//           const normalizedError = handleExecutionErrorResult(
//             res as ExecutionResult
//           );
//           console.log(normalizedError);
//         }
//       } catch (err) {
//         // stopTimer();
//         setIsRequesting(false);
//         console.error("Error during execution:", err);

//         handleExecutionErrorResult({
//           success: false,
//           type: "unexpected_error",
//           error: "An unexpected error occurred. Please try again.",
//         });
//       }
//     }, [
//       selectedBrand,
//       selectedFile,
//       // resetTimer,
//       // startTimer,
//       // stopTimer,
//       updatePlaceholder,
//       handleExecutionSuccess,
//       handleExecutionErrorResult,
//       setTableData,
//     ]);

//     useEffect(() => {
//       if (selectedBrand && selectedFile) {
//         loadFileContent(selectedBrand, selectedFile);
//       }
//     }, [selectedBrand, selectedFile, loadFileContent]);

//     return (
//       <div className="h-[calc(100vh-4rem)] grid grid-cols-4 gap-1 bg-gray-50">
//         <SqlLeftPanel
//           brands={brands}
//           files={files}
//           selectedBrand={selectedBrand}
//           selectedFile={selectedFile}
//           sqlFiles={sqlFiles}
//           isRequesting={isRequesting}
//           inputValues={inputValues}
//           onBrandChange={handleBrandChange}
//           onFileChange={handleFileChange}
//           onPlaceholderChange={handlePlaceholderChange}
//           onExecute={handleExecute}
//           setActiveTabRight={setActiveTabRight}
//           setShowVpnInfo={setShowVpnInfo}
//           setScriptDescription={setScriptDescription}
//           // setShow={setShowVpn}
//         />

//         <SqlRightPanel
//           activeTabRight={activeTabRight}
//           setActiveTabRight={setActiveTabRight}
//           sqlFiles={sqlFiles}
//           isRequesting={isRequesting}
//           // elapsedMs={elapsedMs}
//           tableData={tableData}
//           // dbName={dbName}
//           currentPage={currentPage}
//           totalPages={totalPages}
//           pageSize={pageSize}
//           onPageChange={setCurrentPage}
//           onCredentials={onCredentials}
//           showSupersetError={showVpnInfo}
//           scriptDescription={scriptDescription}
//         />

//         {/* <VpnPopup visible={showVpn} info={showVpnInfo} setShow={setShowVpn} /> */}
//       </div>
//     );
//   }
// );

// SqlLab.displayName = "SqlLab";
