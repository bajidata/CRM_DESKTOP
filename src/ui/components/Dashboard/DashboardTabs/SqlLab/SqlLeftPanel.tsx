import React, { useMemo, memo } from "react";
import type { SqlFile } from "../../../types";
import { segmentConfigs } from "../../../configs/segmentConfigs";

interface SqlLeftPanelProps {
  brands: string[];
  files: string[];
  selectedBrand: string;
  selectedFile: string;
  sqlFiles: SqlFile[];
  isRequesting: boolean;
  inputValues: Record<string, string>;
  onBrandChange: (brand: string) => void;
  onFileChange: (file: string) => void;
  onPlaceholderChange: (placeholderKey: string, value: string) => void;
  onExecute: () => void;
  setActiveTabRight: (tab: string) => void;
  setShowVpnInfo: (info: { title: string; text: string }) => void; // setter
  setScriptDescription: (desc: {
    columns: string[];
    description: string;
  }) => void;
  // setShow: (show: boolean) => void; // setter function
}

export const SqlLeftPanel: React.FC<SqlLeftPanelProps> = memo(
  ({
    brands,
    files,
    selectedBrand,
    selectedFile,
    sqlFiles,
    isRequesting,
    inputValues,
    onBrandChange,
    onFileChange,
    onPlaceholderChange,
    onExecute,
    setActiveTabRight,
    setShowVpnInfo,
    setScriptDescription,
    // setShow,
  }) => {
    // Get unique editable segments
    const uniqueEditableSegments = useMemo(() => {
      if (!selectedFile || sqlFiles.length === 0) return [];

      const file = sqlFiles.find((f) => f.name === selectedFile) || sqlFiles[0];
      const seenValues = new Set();
      const uniqueSegments: { value: string; label: string }[] = [];

      file.parsedSegments.forEach((seg) => {
        if (seg.editable && seg.value && !seenValues.has(seg.value)) {
          seenValues.add(seg.value);
          uniqueSegments.push({ value: seg.value, label: seg.label });
        }
      });

      return uniqueSegments;
    }, [sqlFiles, selectedFile]);

    const handleExecuteClick = () => {
      // Check for empty required inputs
      const emptyInputs = uniqueEditableSegments.filter(
        (seg) => !inputValues[seg.value]?.trim()
      );

      if (emptyInputs.length > 0) {
        // setShow(true);
        setShowVpnInfo({
          title: "Validation Failed",
          text: `Please fill in all required fields: ${emptyInputs
            .map((seg) => seg.label)
            .join(", ")}`,
        });
        // alert(
        //   `Please fill in all required fields: ${emptyInputs
        //     .map((seg) => seg.label)
        //     .join(", ")}`
        // );
        return; // stop execution
      }

      onExecute(); // call parent only if validation passes
    };

    return (
      <div className="">
        <div className="flex items-center justify-between bg-gradient-to-r from-green-500 via-green-600 to-green-700 p-3">
          <h2 className="text-lg font-semibold text-white">
            Editable Contents
          </h2>
        </div>
        <div className="flex flex-col space-y-4 bg-white rounded-lg p-4 overflow-y-auto">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              disabled={isRequesting} // ⬅ disable while running
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                SQL Files
              </label>
              <select
                value={selectedFile}
                onChange={async (e) => {
                  const file = e.target.value;
                  setActiveTabRight("description");
                  onFileChange(file);
                  try {
                    const res = await window.electron?.getSqlByDescription(
                      file
                    );
                    if (res?.success) {
                      // update parent state
                      setScriptDescription({
                        columns: res.columns || [],
                        description: res.description || "",
                      });
                    } else {
                      console.error(
                        "Failed to fetch SQL description:",
                        res?.error
                      );
                      setScriptDescription({ columns: [], description: "" });
                    }
                  } catch (err) {
                    console.error("Error calling sql:getDescription:", err);
                    setScriptDescription({ columns: [], description: "" });
                  }
                }}
                disabled={isRequesting}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select File</option>
                {files.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {uniqueEditableSegments.map((seg) => {
            // console.log(seg)
            const config = segmentConfigs[seg.value] || { type: "text" };

            return (
              <div key={seg.value} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">
                  {seg.label}
                </label>

                {config.type === "date" ? (
                  <input
                    type="date"
                    value={inputValues[seg.value] || ""}
                    onChange={(e) => {
                      // console.log(e.target.value)
                      onPlaceholderChange(seg.value, e.target.value);
                    }}
                    disabled={isRequesting}
                    className="border border-gray-300 text-gray-700 font-semibold rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : config.type === "select" ? (
                  <select
                    value={inputValues[seg.value] || ""}
                    onChange={(e) =>
                      onPlaceholderChange(seg.value, e.target.value)
                    }
                    disabled={isRequesting}
                    className="border border-gray-300 text-gray-700 font-semibold rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select...</option>
                    {config.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={inputValues[seg.value] || ""}
                    onChange={(e) =>
                      onPlaceholderChange(seg.value, e.target.value)
                    }
                    disabled={isRequesting}
                    className="border border-gray-300 text-gray-700 font-semibold rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter value..."
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={handleExecuteClick}
            disabled={isRequesting}
            className={`mt-2 w-full px-4 py-2 rounded transition-colors 
          ${
            isRequesting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          >
            {isRequesting ? "Processing..." : "Execute"}
          </button>
        </div>
      </div>
    );
  }
);

SqlLeftPanel.displayName = "SqlLeftPanel";
