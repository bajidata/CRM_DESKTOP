import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileSpreadsheet,
  FileText,
  Table,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exportToCSV, exportToExcel } from "../../../utils/exportUtils";
import StatusCard from "./StatusCard";

interface ResultPanelProps {
  activeTabRight: string;
  setActiveTabRight: (tab: string) => void;
  isRequesting: boolean;
  tableData: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showSupersetError: { title: string; text: string };
  csvId: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  activeTabRight,
  setActiveTabRight,
  isRequesting,
  tableData,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  showSupersetError,
  csvId,
}) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

  // --- Sorting handler ---
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: "", direction: null }; // reset sort
        return { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // --- Apply sorting before pagination ---
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return tableData;
    return [...tableData].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      // Try numeric comparison first, fallback to string
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }
      return sortConfig.direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [tableData, sortConfig]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setOpen(false);
      const csvFilePth = await exportToCSV(csvId);
      if (csvFilePth) {
        console.log("CSV downloaded to:", csvFilePth);
        setSuccessMsg(`CSV successfully saved to downloads`);
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (error) {
      console.error("CSV export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      setOpen(false);
      const today = new Date().toISOString().split("T")[0];
      await exportToExcel(sortedData, `CRM-Report_${today}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* ✅ Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#0c865e] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-sm font-medium">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#11bb82] via-[#0e996b] to-[#0c865e] p-2">
        <div className="grid grid-cols-2 w-full items-center justify-between pe-2">
          <div className="flex items-start gap-3">
            <h1 className="text-lg font-semibold text-white uppercase flex items-center gap-2">
              <Table className="w-5 h-5" /> Total Rows:{" "}
              <span className="text-white">
                {tableData.length.toLocaleString()}
              </span>
            </h1>
          </div>
          {/* Tabs */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setActiveTabRight("description")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition hover:bg-[#0c865e] ${
                activeTabRight === "description"
                  ? "text-white bg-[#12c086]"
                  : "text-white"
              }`}
              disabled={isRequesting}
            >
              Script Description
            </button>

            <button
              onClick={() => setActiveTabRight("result")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition hover:bg-[#0c865e] ${
                activeTabRight === "result"
                  ? "text-white bg-[#12c086]"
                  : "text-white"
              }`}
              disabled={isRequesting}
            >
              Result
            </button>
          </div>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => tableData.length && !exporting && setOpen(!open)}
            disabled={!tableData.length || exporting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
              tableData.length ? "text-white" : "text-white cursor-not-allowed"
            } ${exporting ? "opacity-70 cursor-wait" : ""}`}
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Download <ChevronDown size={16} />
              </>
            )}
          </button>

          <AnimatePresence>
            {open && tableData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 transition"
                >
                  <FileSpreadsheet size={16} className="text-[#0c865e]" />
                  Excel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 transition"
                >
                  <FileText size={16} className="text-[#0c865e]" />
                  CSV
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                className={`${
                  showSupersetError?.title
                    ? "bg-red-500 text-white"
                    : `text-green-900 bg-gradient-to-r ${
                        isRequesting
                          ? "from-[#22e7a5] via-[#13ac79] to-[#0c865e]"
                          : "bg-[#0c865e] text-white"
                      }`
                }`}
              >
                {tableData.length > 0 ? (
                  Object.keys(tableData[0]).map((key) => {
                    const isSorted = sortConfig.key === key;
                    return (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-4 py-3 text-left font-semibold uppercase tracking-wide whitespace-normal break-words"
                      >
                        <div className="flex items-center gap-1">
                          <span className="max-w-[400px] whitespace-normal break-words">
                            {key}
                          </span>
                          {isSorted ? (
                            sortConfig.direction === "asc" ? (
                              <ChevronUp
                                size={14}
                                className="opacity-1 shrink-0 hover:cursor-pointer"
                              />
                            ) : sortConfig.direction === "desc" ? (
                              <ChevronDown
                                size={14}
                                className="opacity-1 shrink-0 hover:cursor-pointer"
                              />
                            ) : (
                              <ChevronsUpDown
                                size={14}
                                className="opacity-1 shrink-0 hover:cursor-pointer"
                              />
                            )
                          ) : (
                            <ChevronsUpDown
                              size={14}
                              className="opacity-1 shrink-0 hover:cursor-pointer"
                            />
                          )}
                        </div>
                      </th>
                    );
                  })
                ) : (
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide w-full flex items-center justify-between">
                    {showSupersetError?.title || "No Header Available"}!
                    <StatusCard
                      color="text-white"
                      isRequesting={isRequesting}
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-green-50"}`}
                  >
                    {Object.keys(row).map((key) => (
                      <td
                        key={key}
                        className="px-4 py-2 text-gray-700 border-t max-w-[400px] whitespace-normal break-words"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={Object.keys(tableData[0] || {}).length || 1}
                    className="py-10 text-center"
                  >
                    {showSupersetError?.text ? (
                      <div className="flex flex-col items-center space-y-3 text-red-500">
                        <AlertTriangle className="w-16 h-16" />
                        <span className="text-base">
                          {showSupersetError.text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        No available Data to Display!
                      </span>
                    )}
                  </td>
                </tr>
              )}
              {/* <tr className="p-10"><td></td></tr> */}
            </tbody>
          </table>
        </div>
        <div className="p-2"></div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && tableData.length > 0 && (
        <div className="fixed w-[60%] bottom-0 right-2 bg-white p-4 flex justify-between items-center gap-2 border-t z-50">
          <p className="text-gray-800">
            <span className="text-[#0c865e]">Superset</span>: Max Returned Data
            Limit is 10,000.
            
          </p>
          <div>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border text-white bg-[#0c865e] hover:bg-[#085c40] hover:text-white transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-[#0c865e]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border text-white bg-[#0c865e] hover:bg-[#085c40] hover:text-white transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
