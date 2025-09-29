import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { AsanaRightPanel } from "./AsanaRightPanel";
import { Loader2 } from "lucide-react";
import type {
  Section,
  Task,
  InputField,
  VpnInfo,
  Description,
  Assignee,
} from "../../../types";
import {
  handleExecutionError,
  type ExecutionResult,
} from "../../../utils/errorHandlers";
import { DateTimePicker } from "./DateTimePicker";

interface AsanaApiResponse {
  success: boolean;
  data: any[];
  sections?: Section[];
}

interface AsanaSqlLabProps {
  user: any;
  isRequesting: boolean;
  setIsRequesting: (arg: boolean) => void;
  onCredentials: () => void;
  selectedProject: string | null;
}

export const AsanaSqlLab: React.FC<AsanaSqlLabProps> = ({
  user,
  isRequesting,
  setIsRequesting,
  onCredentials,
  selectedProject,
}) => {
  const [asanaSections, setAsanaSections] = useState<Section[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [asanaInputValues, setAsanaInputValues] = useState<
    Record<string, string>
  >({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [activeTabRight, setActiveTabRight] = useState("description");
  const [currentPage, setCurrentPage] = useState(1);
  const [showVpnInfo, setShowVpnInfo] = useState<VpnInfo>({
    title: "",
    text: "",
  });
  const [scriptDescription, setScriptDescription] = useState<Description>({
    columns: [],
    description: "",
  });
  const [taskInfo, setTaskInfo] = useState<Assignee | null>(null);
  const [isFetchingAsana, setIsFetchingAsana] = useState(true);
  const [csvId, setCsvId] = useState("");
  const pageSize = 20;
  const totalPages = Math.ceil(tableData.length / pageSize);

  const taskOptions = asanaSections.flatMap((sec) =>
    sec.tasks.map((task) => ({
      value: task.gid,
      label: `${task.name}`,
      task,
    }))
  );

  useEffect(() => {
    const fetchTasks = async () => {
      setIsFetchingAsana(true);
      if (!selectedProject) {
        setAsanaSections([]);
        setSelectedTask(null);
        setAsanaInputValues({});
        setTaskInfo({
          gid: "",
          name: "",
          resource_type: "",
          script_author: "",
          requestor: "",
        });
        setScriptDescription({ columns: [], description: "" });
        setIsFetchingAsana(false);
        return;
      }

      try {
        const res =
          (await window.electron?.getAsanaTasks(selectedProject, user.role)) ??
          ({ success: false, data: [], sections: [] } as AsanaApiResponse);

        if (res?.success && res.sections) {
          console.log("------------------------------------------")
          console.log(res.sections)
          setAsanaSections(res.sections);
          const firstTask = res.sections[0]?.tasks[0] || null;

          if (firstTask) handleSelectTask(firstTask);
          else {
            setSelectedTask(null);
            setAsanaInputValues({});
            setScriptDescription({ columns: [], description: "" });
            setTaskInfo({
              gid: "",
              name: "",
              resource_type: "",
              script_author: "",
              requestor: "",
            });
          }
        } else {
          setAsanaSections([]);
          setSelectedTask(null);
          setAsanaInputValues({});
          setScriptDescription({ columns: [], description: "" });
          setTaskInfo({
            gid: "",
            name: "",
            resource_type: "",
            script_author: "",
            requestor: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch Asana tasks:", err);
        setAsanaSections([]);
        setSelectedTask(null);
        setAsanaInputValues({});
        setScriptDescription({ columns: [], description: "" });
        setTaskInfo({
          gid: "",
          name: "",
          resource_type: "",
          script_author: "",
          requestor: "",
        });
      } finally {
        setIsFetchingAsana(false);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  const handleSelectTask = useCallback(
    (task: Task & { inputs?: InputField[] }) => {
      setSelectedTask(task);
      console.log(task);
      if (task.inputs) {
        const initialValues: Record<string, string> = {};
        task.inputs.forEach((input) => {
          initialValues[input.name] = input.default;
        });
        setAsanaInputValues(initialValues);
      }

      setTaskInfo({
        gid: task.assignee?.gid || "",
        name: task.assignee?.name || "",
        resource_type: task.assignee?.resource_type || "",
        script_author: task.latest_sql?.created_by || "",
        requestor: task.identity.requestor?.trim() // check if not null/empty
          ? task.identity.requestor
          : task.created_by?.name // fallback: use created_at as string
          ? task.created_by?.name
          : "Asana", // final default
      });

      setScriptDescription({
        columns: Object.keys(
          task.latest_sql?.parsed_sql.editable_contents || {}
        ),
        description: task.notes 
        // description: (task.notes || "No description available").replace(
        //   /requestor:\s*.+(\r?\n)?/i,
        //   ""
        // ),
      });

      setActiveTabRight("description");
    },
    []
  );

  type InputType = "date" | "datetime" | "select";
  const handleInputChange = useCallback(
    (name: string, value: string, type: InputType) => {
      let formattedValue = value;
      if (type === "datetime" && formattedValue) {
        formattedValue = formattedValue.replace("T", " ");
        if (formattedValue.length === 16) formattedValue += ":00";
      }
      setAsanaInputValues((prev) => ({ ...prev, [name]: formattedValue }));
    },
    []
  );

  const normalizeDateTime = (value: string) => {
    if (!value) return "";
    const [datePart, timePart] = value.split(" ");
    if (!timePart) return datePart;
    const normalizedTime = timePart.replace(/-/g, ":");
    const parts = normalizedTime.split(":");
    while (parts.length < 3) parts.push("00");
    return `${datePart} ${parts.slice(0, 3).join(":")}`;
  };

  const handleExecuteTask = useCallback(async () => {
    if (!selectedTask?.latest_sql) return;

    let sqlContent = selectedTask.latest_sql.parsed_sql.template_script;
    const placeholders =
      selectedTask.latest_sql.parsed_sql.editable_contents || {};

    Object.entries(placeholders).forEach(([key, defaultValue]) => {
      let value = asanaInputValues[key] ?? defaultValue;
      if (
        /\d{2}-\d{2}-\d{2}$/.test(value) ||
        /\d{2}:\d{2}/.test(value) ||
        value.includes("T")
      ) {
        value = normalizeDateTime(value);
      }
      sqlContent = sqlContent.replaceAll(`{{${key}}}`, value);
    });

    setIsRequesting(true);
    setTableData([]);
    setCurrentPage(1);
    setShowVpnInfo({ title: "", text: "" });

    console.log(sqlContent);
    try {
      const res = await window.electron?.saveFileContent(
        selectedTask.identity.brand || "",
        selectedTask.latest_sql.gid,
        sqlContent
      );
      console.log(res);

      setIsRequesting(false);
      setActiveTabRight("result");
      if (res?.success) {
        console.log(res.csv_link);
        setCsvId(res.csv_link || "");
        setTableData(res.data || []);
      } else {
        const vpnInfo = handleExecutionError(res as ExecutionResult).vpnInfo;
        console.log(vpnInfo);
        setShowVpnInfo({
          ...vpnInfo,
          text: typeof vpnInfo?.text === "string" ? vpnInfo.text : "Error",
        });
      }
    } catch (err) {
      setIsRequesting(false);
      console.error("Execution failed:", err);
      setShowVpnInfo({ title: "Error", text: "An unexpected error occurred." });
    }
  }, [selectedTask, asanaInputValues, setIsRequesting]);

  if (isFetchingAsana) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center bg-green-50 p-8 rounded-2xl shadow-lg animate-pulse">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mb-4 animate-spin"></div>
          <p className="text-green-700 font-bold text-lg">
            Loading Asana tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-4 gap-1 bg-gray-50 p-2">
      <div className="col-span-1 border-r pr-2">
        <label className="block font-medium mb-2 text-[#0c865e]">
          Asana Tasks
        </label>

        {/* Modern Task Select */}
        <Select
          value={
            selectedTask
              ? {
                  value: selectedTask.gid,
                  label: selectedTask.name,
                  task: selectedTask,
                }
              : null
          }
          onChange={(opt) => {
            if (opt?.task) {
              handleSelectTask(opt.task); // only call if task exists
            } else {
              // Handle clearing the selection
              setSelectedTask(null);
              setAsanaInputValues({});
              setScriptDescription({ columns: [], description: "" });
              setTaskInfo({
                gid: "",
                name: "",
                resource_type: "",
                script_author: "",
                requestor: "",
              });
            }
          }}
          options={taskOptions}
          isClearable
          isSearchable
          isDisabled={isFetchingAsana}
          placeholder="Select a task"
          menuPortalTarget={document.body} // ✅ render dropdown in body
          menuPosition="fixed" // ✅ position it correctly
          styles={{
            control: (base) => ({
              ...base,
              borderColor: "#34D399",
              boxShadow: "none",
              "&:hover": { borderColor: "#10B981" },
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#10B981"
                : state.isFocused
                ? "#D1FAE5"
                : "white",
              color: state.isSelected ? "white" : "#065F46",
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // make sure it's above everything
            placeholder: (base) => ({ ...base, color: "#065F46" }),
          }}
        />

        {/* Input Fields */}
        {/* Input Fields */}
        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-4rem-150px)]">
          {selectedTask?.inputs?.map((input) => (
            <div key={input.name} className="mb-4">
              <label className="block text-sm font-semibold text-[#0c865e] mb-1">
                {input.name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </label>

              {input.type === "select" ? (
                <Select
                  value={
                    input.options?.find(
                      (opt) => opt === asanaInputValues[input.name]
                    )
                      ? {
                          value: asanaInputValues[input.name],
                          label: asanaInputValues[input.name],
                        }
                      : null
                  }
                  onChange={(opt) =>
                    handleInputChange(input.name, opt?.value || "", "select")
                  }
                  options={input.options?.map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                  isClearable
                  menuPortalTarget={document.body} // render dropdown in body
                  menuPosition="fixed" // use fixed positioning
                  menuShouldBlockScroll={true} // optional: block background scroll
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#0c865e",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#10B981" },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#10B981"
                        : state.isFocused
                        ? "#D1FAE5"
                        : "white",
                      color: state.isSelected ? "white" : "#065F46",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // always on top
                  }}
                />
              ) : input.type === "date" || input.type === "datetime" ? (
                <DateTimePicker
                  type={input.type}
                  value={normalizeDateTime(asanaInputValues[input.name] || "")}
                  onChange={(val) =>
                    handleInputChange(input.name, val, input.type as InputType)
                  }
                />
              ) : (
                <textarea
                  value={asanaInputValues[input.name] || ""}
                  onChange={(e) => {
                    handleInputChange(
                      input.name,
                      e.target.value,
                      "text" as any
                    );
                    const target = e.target;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                  className="border border-[#10B981] rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 resize-none overflow-hidden"
                />
              )}
            </div>
          ))}
        </div>

        {selectedTask && (
          <button
            onClick={handleExecuteTask}
            disabled={
              isRequesting ||
              !selectedTask ||
              Object.values(asanaInputValues).some(
                (val) => !val || val.trim() === ""
              )
            }
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full shadow text-white ${
              isRequesting ||
              Object.values(asanaInputValues).some(
                (val) => !val || val.trim() === ""
              )
                ? "bg-[#0c865e] cursor-not-allowed"
                : "bg-[#0c865e] hover:bg-[#085f42]"
            }`}
          >
            {isRequesting ? (
              <>
              Run Task
                <Loader2 className="w-4 h-4 animate-spin" />
                
              </>
            ) : (
              "Run Task"
            )}
          </button>
        )}
      </div>

      <AsanaRightPanel
        activeTabRight={activeTabRight}
        setActiveTabRight={setActiveTabRight}
        isRequesting={isRequesting}
        tableData={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onCredentials={onCredentials}
        showSupersetError={showVpnInfo}
        scriptDescription={scriptDescription}
        taskInfo={taskInfo}
        csvId={csvId}
      />
    </div>
  );
};

AsanaSqlLab.displayName = "AsanaSqlLab";
