import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar } from "lucide-react";

type InputType = "date" | "datetime";

interface Props {
  type: InputType;
  value: string;
  onChange: (value: string) => void;
}

export const DateTimePicker: React.FC<Props> = ({ type, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      enableTime: type === "datetime",
      time_24hr: true,
      enableSeconds: type === "datetime",
      dateFormat: type === "datetime" ? "Y-m-d H:i:S" : "Y-m-d",
      defaultDate: value || undefined,
      onChange: (_, dateStr) => onChange(dateStr),
    });

    return () => fp.destroy();
  }, [type, value, onChange]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className="flatpickr-input border border-[#0c865e] rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 pr-10"
        placeholder={type === "datetime" ? "Select date & time" : "Select date"}
      />
      <Calendar className="w-5 h-5 text-[#0c865e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
