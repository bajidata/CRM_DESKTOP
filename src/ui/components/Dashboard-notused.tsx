// import { signOut } from "firebase/auth";
// import { useEffect, useState, useRef } from "react";
// import { auth } from "../firebase";
// import LoaderModal from "./Loader";
// import VpnPopup from "./VpnPopup";
// import CredPopup from "./CredPopup-notused";
// import { Database, User, CheckCircle } from "lucide-react"; //Home
// interface CrendentialInfo {
//   visible: boolean;
//   username: string;
//   password: string;
// }

// interface VpnInfo {
//   title: string;
//   text: string;
// }

// interface DashboardProps {
//   user: any;
//   setUser: (u: any) => void;
// }

// interface SqlSegment {
//   text: string;
//   editable?: boolean;
//   value?: string;
//   label: string;
// }

// interface SqlFile {
//   name: string;
//   content: string;
//   parsedSegments: SqlSegment[];
// }

// export default function Dashboard({ user, setUser }: DashboardProps) {
//   const [activeTab, setActiveTab] = useState("sql");
//   const [brands, setBrands] = useState<string[]>([]);
//   const [files, setFiles] = useState<string[]>([]);
//   const [selectedBrand, setSelectedBrand] = useState<string>("");
//   const [selectedFile, setSelectedFile] = useState<string>("");
//   const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);
//   // const [status, setStatus] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showVpn, setShowVpn] = useState(false);
//   const [showVpnInfo, setShowVpnInfo] = useState<VpnInfo>({
//     title: "",
//     text: "",
//   });
//   const [credential, setCredential] = useState<CrendentialInfo>({
//     visible: false,
//     username: "",
//     password: "",
//   });

//   const tabNames: Record<string, { label: string; icon: React.ReactNode }> = {
//     // dashboard: { label: "Dashboard", icon: <Home size={18} /> },
//     sql: { label: "SQL Lab", icon: <Database size={18} /> },
//     profile: { label: "Profile", icon: <User size={18} /> },
//   };

//   const [activeTabRight, setActiveTabRight] = useState("sql"); // "sql" or "result"
//   const [elapsedMs, setElapsedMs] = useState(0);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const [isRequesting, setIsRequesting] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [dbName, setDbName] = useState("No Database");

//   // --- Add these for pagination ---
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10; // rows per page
//   const totalPages = Math.ceil(tableData.length / pageSize);
//   const paginatedData = tableData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const startTimer = () => {
//     // clear any old timer before starting new one
//     if (intervalRef.current) clearInterval(intervalRef.current);

//     const start = Date.now();
//     intervalRef.current = setInterval(() => {
//       setElapsedMs(Date.now() - start);
//     }, 50); // update every 50ms
//   };

//   const stopTimer = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   const resetTimer = () => {
//     stopTimer();
//     setElapsedMs(0);
//   };

//   const formatTime = (ms: number) => {
//     const seconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const remSeconds = seconds % 60;
//     const milliseconds = ms % 1000;
//     return `${minutes}:${remSeconds < 10 ? "0" : ""}${remSeconds}.${Math.floor(
//       milliseconds / 100
//     )}`;
//   };

//   // Load brands on mount
//   useEffect(() => {
//     window.electron?.getBrands().then((res) => {
//       if (res.success) setBrands(res.brands ?? []);
//     });
//   }, []);

//   const handleBrandChange = async (brand: string) => {
//     setSelectedBrand(brand);
//     setSelectedFile("");
//     // setStatus(null);
//     setFiles([]);
//     setSqlFiles([]);

//     const res = await window.electron?.getFiles(brand);
//     if (res?.success) setFiles(res.files ?? []);
//   };

//   const parseSql = (sql: string): SqlSegment[] => {
//     const regex = /(\{\{.*?\}\})/g;
//     const parts = sql.split(regex);

//     return parts.map((part) => {
//       const editable = part.startsWith("{{") && part.endsWith("}}");
//       const value = editable ? part.slice(2, -2) : undefined;
//       const label = editable ? detectLabel(value || "") : "";
//       console.log(label);
//       return {
//         text: part,
//         editable,
//         value,
//         label,
//       };
//     });
//   };

//   const handleFileChange = async (file: string) => {
//     setSelectedFile(file);
//     // setStatus(null);

//     if (!selectedBrand) return;

//     const res = await window.electron?.getFileContent(selectedBrand, file);
//     if (res?.success && res.content) {
//       const parsed = parseSql(res.content);
//       setSqlFiles([
//         { name: file, content: res.content, parsedSegments: parsed },
//       ]);
//     }
//   };

//   // Helper: detect label from value with row context
//   const detectLabel = (val: string) => {
//     // Common SQL placeholder patterns and their labels
//     const labelMappings: Record<string, string> = {
//       start_date: "Start Date",
//       end_date: "End Date",
//       currency: "Currency",
//       min_deposit: "Minimum Deposit",
//       max_deposit: "Maximum Deposit",
//       bonus_code: "Bonus Code",
//       bonus_title: "Bonus Title",
//       min_init_deposit: "Minimum Initial Deposit",
//       promo_period: "Promotion Period",
//       target_currency: "Target Currency",
//     };

//     // Check if we have a predefined mapping
//     if (labelMappings[val]) {
//       return labelMappings[val];
//     }

//     // Fallback: convert underscores to spaces and capitalize
//     return val
//       .split("_")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   const handlePlaceholderChange = (
//     fileIdx: number,
//     segIdx: number,
//     value: string
//   ) => {
//     const newFiles = [...sqlFiles];
//     const targetSeg = newFiles[fileIdx].parsedSegments[segIdx];
//     if (!targetSeg.editable || !targetSeg.value) return;

//     // Update all identical placeholders
//     newFiles[fileIdx].parsedSegments = newFiles[fileIdx].parsedSegments.map(
//       (seg) =>
//         seg.editable && seg.value === targetSeg.value ? { ...seg, value } : seg
//     );

//     // Rebuild content
//     newFiles[fileIdx].content = newFiles[fileIdx].parsedSegments
//       .map((seg) => (seg.editable ? `{{${seg.value}}}` : seg.text))
//       .join("");

//     setSqlFiles(newFiles);
//   };

//   const handleSaveAndExecute = async () => {
//     if (!selectedBrand || !selectedFile || sqlFiles.length === 0) return;

//     // setStatus("Saving...");
//     resetTimer(); // reset before starting
//     setElapsedMs(0);
//     setIsRequesting(true); // show loader and start timer
//     startTimer(); // start tracking time

//     const sqlToSave = sqlFiles[0].content;
//     // 🔹 Switch tab immediately
//     setActiveTabRight("result");

//     try {
//       const res = await window.electron?.saveFileContent(
//         selectedBrand,
//         selectedFile,
//         sqlToSave
//       );

//       // for debugging only remove the seTImeout in prodcution
//       // setTimeout(() => {
//       stopTimer(); // stop timer after request completes
//       setIsRequesting(false); // hide loader
//       console.log(res);

//       if (res?.success) {
//         setShowVpn(false);
//         // setStatus("✅ Saved successfully!");
//         setTableData(res?.data || []); // store the table data in state
//         setDbName(res?.data.title || "No Database");
//       } else {
//         if (res?.type === "vpn_error") {
//           setShowVpnInfo({
//             title: "VPN Required",
//             text: "To access this service, please connect to a VPN and try again.",
//           });
//         } else if (res?.type === "auth_error") {
//           setShowVpnInfo({
//             title: "Credential Error",
//             text: "Your username or password is incorrect. Please check and try again.",
//           });
//         } else if (res?.type === "invalid_credentials") {
//           setShowVpnInfo({
//             title: "Credential Error",
//             text: "Your username or password is incorrect. Please check and try again.",
//           });
//         } else {
//           setShowVpnInfo({
//             title: "Unexpected Error",
//             text: res?.error || "Something went wrong. Please try again later.",
//           });
//         }
//         setShowVpn(true);
//         // setStatus("❌ Failed to save file: " + res?.error);
//       }
//     } catch (err) {
//       const errorMsg =
//         typeof err === "object" && err !== null && "message" in err
//           ? (err as { message?: string }).message
//           : String(err);
//       // setStatus("❌ Error: " + errorMsg);
//       setShowVpnInfo({
//         title: "Unexpected Error",
//         text: errorMsg || "Something went wrong. Please try again later.",
//       });
//       setShowVpn(true);
//     } finally {
//       stopTimer();
//       setIsRequesting(false);
//     }

//     // }, 10000);
//   };

//   const wait = (ms: number) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   const handleLogout = async () => {
//     setLoading(true);
//     await wait(2000);
//     try {
//       await signOut(auth);
//       setUser(null);
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // handle credentials
//   const handleCredentials = async () => {
//     // alert("credentials");
//     const credRes = await window.electron?.getCredentials();
//     console.log(credRes);
//     // if (!credRes?.success) {
//     setCredential({
//       visible: true,
//       username: credRes?.credentials?.username || "",
//       password: credRes?.credentials?.password || "",
//     });
//     // }
//   };

//   // Save handler
//   const handleSaveCreds = async (username: string, password: string) => {
//     console.log(username, password);
//     // call backend to save
//     const saveRes = await window.electron?.saveCredentials({
//       username,
//       password,
//     });

//     if (saveRes?.success) {
//       setCredential({
//         visible: false,
//         username,
//         password,
//       });
//     } else {
//       alert("Can't Save your credentials...");
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-lg flex flex-col">
//         <div className="p-6 text-xl font-bold border-b">CRM</div>
//         <nav className="flex-1 p-4 space-y-2">
//           {Object.keys(tabNames).map((tab) => (
//             <button
//               key={tab}
//               className={`flex items-center w-full text-left px-4 py-2 rounded ${
//                 activeTab === tab
//                   ? "bg-green-500 text-white"
//                   : "text-gray-700 hover:bg-gray-200"
//               }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               <span className="mr-2">{tabNames[tab].icon}</span>
//               {tabNames[tab].label}
//             </button>
//           ))}
//         </nav>

//         <div className="p-4 border-t">
//           <button
//             onClick={handleLogout}
//             className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//           >
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <header className="bg-white shadow p-4 flex justify-between items-center">
//           <h1 className="text-xl font-semibold">{tabNames[activeTab].label}</h1>
//           <div className="flex items-center space-x-4">
//             {user.photoURL && (
//               <img
//                 src={user.photoURL}
//                 alt="Avatar"
//                 className="w-10 h-10 rounded-full"
//               />
//             )}
//             <span className="font-medium">
//               {user.displayName ?? user.email}
//             </span>
//           </div>
//         </header>

//         <main className="flex-1 p-2 flex flex-col">
//           {activeTab === "dashboard" && (
//             <div>
//               <h2 className="text-lg font-bold mb-4">Dashboard Overview</h2>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 <div className="p-4 bg-white rounded shadow">Card 1</div>
//                 <div className="p-4 bg-white rounded shadow">Card 2</div>
//                 <div className="p-4 bg-white rounded shadow">Card 3</div>
//               </div>
//             </div>
//           )}

//           {activeTab === "sql" && (
//             <div className="h-[calc(100vh-4rem)] grid grid-cols-4 gap-2 bg-gray-50">
//               {/* Left Controls */}
//               <div className="flex flex-col space-y-4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
//                 <h2 className="text-lg font-semibold text-gray-700">
//                   Editable Contents
//                 </h2>

//                 {/* Brand Selector */}
//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium text-gray-600">
//                     Brand
//                   </label>
//                   <select
//                     value={selectedBrand}
//                     onChange={(e) => handleBrandChange(e.target.value)}
//                     className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   >
//                     <option value="">Select Brand</option>
//                     {brands.map((b) => (
//                       <option key={b} value={b}>
//                         {b}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* File Selector */}
//                 {files.length > 0 && (
//                   <div className="flex flex-col">
//                     <label className="text-sm font-medium text-gray-600">
//                       SQL Files
//                     </label>
//                     <select
//                       value={selectedFile}
//                       onChange={(e) => handleFileChange(e.target.value)}
//                       className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                     >
//                       <option value="">Select File</option>
//                       {files.map((f) => (
//                         <option key={f} value={f}>
//                           {f}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {/* Unique Placeholder Inputs */}
//                 {sqlFiles.length > 0 &&
//                   (() => {
//                     const editableSegs = Array.from(
//                       new Map(
//                         sqlFiles[0].parsedSegments
//                           .filter((seg) => seg.editable)
//                           .map((seg) => [seg.value, seg])
//                       ).values()
//                     );

//                     return editableSegs.map((seg, idx) => {
//                       console.log("Editable segment:", seg.label);
//                       return (
//                         <div key={idx} className="flex flex-col">
//                           <label className="text-sm font-medium text-gray-600">
//                             {seg.label}
//                           </label>
//                           <input
//                             type="text"
//                             value={seg.value}
//                             onChange={(e) =>
//                               handlePlaceholderChange(
//                                 0,
//                                 sqlFiles[0].parsedSegments.findIndex(
//                                   (s) => s.value === seg.value
//                                 ),
//                                 e.target.value
//                               )
//                             }
//                             className="border border-green-500 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                           />
//                         </div>
//                       );
//                     });
//                   })()}

//                 {/* Save Button */}
//                 <button
//                   onClick={handleSaveAndExecute}
//                   disabled={isRequesting} // disable when request is in progress
//                   className={`mt-2 w-full px-4 py-2 rounded transition-colors 
//                   ${
//                     isRequesting
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-green-600 hover:bg-green-700 text-white"
//                   }`}
//                 >
//                   {isRequesting ? "Processing..." : "Execute"}
//                 </button>

//                 {/* {status && (
//                   <p className="mt-2 text-sm text-gray-600">{status}</p>
//                 )} */}
//               </div>

//               {/* Right Panel */}
//               <div className="col-span-3 flex flex-col bg-white rounded-lg shadow-md p-4 font-mono text-sm">
//                 {/* Tab Header (fixed) */}
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={() => setActiveTabRight("sql")}
//                       className={`px-3 py-2 font-semibold rounded transition ${
//                         activeTabRight === "sql"
//                           ? "text-white bg-green-500"
//                           : "text-gray-700 bg-gray-200 hover:bg-green-500 hover:text-white"
//                       }`}
//                     >
//                       SQL Preview
//                     </button>

//                     <button
//                       onClick={() => setActiveTabRight("result")}
//                       className={`px-3 py-2 font-semibold rounded transition ${
//                         activeTabRight === "result"
//                           ? "text-white bg-green-500"
//                           : "text-gray-700 bg-gray-200 hover:bg-green-500 hover:text-white"
//                       }`}
//                     >
//                       Result
//                     </button>
//                   </div>

//                   <div>
//                     <button
//                       onClick={handleCredentials}
//                       className="px-3 py-2 bg-gray-200 font-semibold text-gray-700 rounded hover:bg-green-500 hover:text-white transition"
//                     >
//                       Credentials
//                     </button>
//                   </div>
//                 </div>

//                 {/* Scrollable Tab Content */}
//                 <div className="flex-1 max-h-[80vh] overflow-y-auto">
//                   {activeTabRight === "sql" && (
//                     <div className="w-full border border-gray-300 rounded p-3 bg-gray-50 whitespace-pre-wrap">
//                       {sqlFiles.length > 0 ? (
//                         sqlFiles[0].parsedSegments.map((seg, idx) =>
//                           seg.editable ? (
//                             <span
//                               key={idx}
//                               className="bg-green-100 text-green-800 px-1 rounded"
//                             >
//                               {seg.value}
//                             </span>
//                           ) : (
//                             <span key={idx}>{seg.text}</span>
//                           )
//                         )
//                       ) : (
//                         <p className="text-gray-500 mt-2">
//                           Select a file to view SQL content.
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {activeTabRight === "result" && (
//                     <div className="flex flex-col gap-2">
//                       {/* Status Bar */}
//                       <div className="w-full border border-gray-300 rounded p-3 bg-gray-50 flex items-center gap-2">
//                         {isRequesting ? (
//                           <div className={`loader-scrapper`}></div>
//                         ) : (
//                           <CheckCircle className="w-6 h-6 text-green-600" />
//                         )}
//                         <h1>
//                           Sending request{" "}
//                           <span className="text-green-600">
//                             {formatTime(elapsedMs)}
//                           </span>
//                         </h1>
//                       </div>

//                       {/* Table + Actions */}
//                       <div className="w-full border border-gray-300 rounded p-3 bg-gray-50 overflow-auto">
//                         {tableData.length > 0 ? (
//                           <>
//                             {/* Action buttons */}
//                             <div className="flex items-center justify-between mb-3">
//                               <div>
//                                 <h1>{dbName}</h1>
//                               </div>
//                               <div className="flex justify-end gap-2">
//                                 <button
//                                   onClick={() => {
//                                     const today = new Date()
//                                       .toISOString()
//                                       .split("T")[0]; // e.g. 2025-08-22
//                                     const fileName = `CRM-Report_${today}.csv`;

//                                     const headers = Object.keys(
//                                       tableData[0]
//                                     ).join(",");
//                                     const rows = tableData
//                                       .map((row) =>
//                                         Object.values(row)
//                                           .map((val) => `"${val}"`) // wrap in quotes
//                                           .join(",")
//                                       )
//                                       .join("\n");
//                                     const csv = `${headers}\n${rows}`;
//                                     const blob = new Blob([csv], {
//                                       type: "text/csv;charset=utf-8;",
//                                     });
//                                     const url = URL.createObjectURL(blob);
//                                     const link = document.createElement("a");
//                                     link.href = url;
//                                     link.setAttribute("download", fileName);
//                                     document.body.appendChild(link);
//                                     link.click();
//                                     document.body.removeChild(link);
//                                   }}
//                                   className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                                 >
//                                   Export CSV
//                                 </button>

//                                 <button
//                                   onClick={() => {
//                                     const today = new Date()
//                                       .toISOString()
//                                       .split("T")[0]; // e.g. 2025-08-22
//                                     const fileName = `CRM-Report_${today}.xlsx`;

//                                     import("xlsx").then((XLSX) => {
//                                       const worksheet =
//                                         XLSX.utils.json_to_sheet(tableData);
//                                       const workbook = XLSX.utils.book_new();
//                                       XLSX.utils.book_append_sheet(
//                                         workbook,
//                                         worksheet,
//                                         "Data"
//                                       );
//                                       XLSX.writeFile(workbook, fileName);
//                                     });
//                                   }}
//                                   className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                                 >
//                                   Export Excel
//                                 </button>
//                               </div>
//                             </div>

//                             {/* Table */}
//                             {/* Table */}
//                             <table className="w-full border-collapse text-sm">
//                               <thead>
//                                 <tr className="bg-green-100 text-green-900">
//                                   {Object.keys(tableData[0]).map((key) => (
//                                     <th
//                                       key={key}
//                                       className="px-4 py-2 text-left font-semibold uppercase tracking-wide"
//                                     >
//                                       {key}
//                                     </th>
//                                   ))}
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {paginatedData.map((row, idx) => (
//                                   <tr
//                                     key={idx}
//                                     className={`${
//                                       idx % 2 === 0
//                                         ? "bg-green-50"
//                                         : "bg-green-25"
//                                     } hover:bg-green-200 transition-colors`}
//                                   >
//                                     {Object.keys(row).map((key) => (
//                                       <td
//                                         key={key}
//                                         className="border-t px-4 py-2 text-green-900"
//                                       >
//                                         {row[key]}
//                                       </td>
//                                     ))}
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                             {totalPages > 1 && (
//                               <div className="flex justify-end gap-2 mt-2">
//                                 <button
//                                   onClick={() =>
//                                     setCurrentPage((p) => Math.max(p - 1, 1))
//                                   }
//                                   disabled={currentPage === 1}
//                                   className="px-3 py-1 bg-gray-200 rounded hover:bg-green-500 hover:text-white transition disabled:opacity-50"
//                                 >
//                                   Prev
//                                 </button>
//                                 <span className="px-3 py-1">
//                                   Page {currentPage} of {totalPages}
//                                 </span>
//                                 <button
//                                   onClick={() =>
//                                     setCurrentPage((p) =>
//                                       Math.min(p + 1, totalPages)
//                                     )
//                                   }
//                                   disabled={currentPage === totalPages}
//                                   className="px-3 py-1 bg-gray-200 rounded hover:bg-green-500 hover:text-white transition disabled:opacity-50"
//                                 >
//                                   Next
//                                 </button>
//                               </div>
//                             )}
//                           </>
//                         ) : (
//                           <p className="text-gray-500">No data to display</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "profile" && (
//             <div className="bg-white p-6 rounded shadow max-w-md">
//               <h2 className="text-lg font-bold mb-4">Profile</h2>
//               <p>
//                 <strong>UID:</strong> {user.uid}
//               </p>
//               <p>
//                 <strong>Email:</strong> {user.email}
//               </p>
//               <p>
//                 <strong>Role:</strong> {user.role}
//               </p>
//             </div>
//           )}

//           {activeTab === "accounts" && (
//             <div className="bg-white p-6 rounded shadow max-w-md">
//               <h2 className="text-lg font-bold mb-4">Accounts</h2>
//             </div>
//           )}

//           {loading && (
//             <LoaderModal
//               type={false}
//               visible={loading}
//               message="Logging you out..."
//               icon={"icon"}
//               color="green-500"
//               size={6}
//             />
//           )}

//           <VpnPopup visible={showVpn} info={showVpnInfo} setShow={setShowVpn} />
//           <CredPopup
//             creds={credential}
//             onSave={handleSaveCreds}
//             onClose={() => setCredential({ ...credential, visible: false })}
//           />
//         </main>
//       </div>
//     </div>
//   );
// }
