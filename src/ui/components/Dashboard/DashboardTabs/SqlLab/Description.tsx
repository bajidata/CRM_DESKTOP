import React from "react";
import { Database, FileText, User } from "lucide-react";
import { motion } from "framer-motion";
import StatusCard from "./StatusCard";

interface DescriptionPreviewProps {
  activeTabRight: string;
  setActiveTabRight: (tab: string) => void;
  isRequesting: boolean;
  description: string;
  columns?: string[];
  taskInfo: any;
}

const DescriptionPreview: React.FC<DescriptionPreviewProps> = ({
  activeTabRight,
  setActiveTabRight,
  isRequesting,
  description,
  columns = [],
  taskInfo,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#11bb82] via-[#0e996b] to-[#0c865e] p-3 rounded-sm">
        <h2 className="text-lg font-semibold text-white uppercase flex items-center gap-2">
          <FileText className="w-5 h-5" /> Description
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition hover:bg-[#0c865e] ${
              activeTabRight === "description"
                ? "text-white bg-[#12c086]"
                : "text-white"
            }`}
            onClick={() => setActiveTabRight("description")}
            disabled={isRequesting}
          >
            Script Description
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition hover:bg-[#0c865e] ${
              activeTabRight === "result"
                ? "text-white bg-[#12c086]"
                : "text-white"
            }`}
            onClick={() => setActiveTabRight("result")}
            disabled={isRequesting}
          >
            Result
          </button>
        </div>
      </div>

      {/* Loader */}
      <div
        className={`p-2 ${isRequesting ? "flex" : "hidden"} items-center justify-end bg-gradient-to-r from-[#24f8b2] via-[#13ac79] to-[#0c865e]`}
      >
        <StatusCard color="text-white" isRequesting={isRequesting} />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-4 space-y-6">
        {/* Task Info */}
        {taskInfo?.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 p-2 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0c865e]" />
              <h3 className="text-base font-semibold text-[#0c865e]">
                Task Owner:
              </h3>
              <p className="text-gray-700 text-lg">{taskInfo.requestor}</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0c865e]" />
              <h3 className="text-base font-semibold text-[#0c865e]">
                Script Author:
              </h3>
              <p className="text-gray-700 text-lg">{taskInfo.script_author}</p>
            </div>
          </motion.div>
        )}

        {/* Description */}
        <div className="whitespace-pre-wrap text-gray-700 px-4">{description || "No description available."}</div>

        {/* Columns */}
        {columns.length > 0 && (
          <div className="px-4">
            <h2 className="text-lg font-semibold text-[#0c865e] mb-2">Columns:</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {columns.map((col) => (
                <motion.li
                  key={col}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition flex gap-2 items-start break-words"
                >
                  <Database className="w-5 h-5 text-[#0c865e] mb-2 flex-shrink-0" />
                  <div className="w-full text-gray-700 whitespace-pre-wrap break-words max-h-[300px] overflow-auto">
                    {col}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionPreview;
