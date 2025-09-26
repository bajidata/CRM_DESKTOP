import React from "react";

interface LoaderModalProps {
  type?: boolean,
  message?: string;
  icon?: React.ReactNode;
  size?: number; // spinner size in px
  color?: string; // spinner color, e.g., "green-500"
  visible: boolean; // control visibility
}

const LoaderModal: React.FC<LoaderModalProps> = ({
  type,
  message = "Loading...",
  icon,
  size = 12,
  color = "green-500",
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center gap-4 space-y-4 w-fit h-fit">
        {icon ? (
          // <div className="text-4xl">{icon}</div>
          <div className={`loader-auth ${type ? 'text-green-500' : 'text-red-500'}`}></div>
        ) : (
          <div
            className={`animate-spin rounded-full border-4 border-${color} border-t-transparent`}
            style={{ width: `${size * 8}px`, height: `${size * 8}px` }}
          ></div>
        )}
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default LoaderModal;
