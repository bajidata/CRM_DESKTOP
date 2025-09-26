import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react"; // optional icons

interface CredModalProps {
  creds: { visible: boolean; username: string; password: string };
  onSave: (username: string, password: string) => void;
  onClose: () => void;
}

const CredPopup: React.FC<CredModalProps> = ({ creds, onSave, onClose }) => {
  const [username, setUsername] = useState(creds.username || "");
  const [password, setPassword] = useState(creds.password || "");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Sync state when creds change (like reopening the modal)
  useEffect(() => {
    if (creds.visible) {
      setUsername(creds.username || "");
      setPassword(creds.password || "");
    }
  }, [creds]);

  if (!creds?.visible) return null;

  const handleSubmit = () => {
    if (!username || !password) return; // simple validation
    onSave(username, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Superset Credentials
        </h2>

        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Password input with toggle */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default CredPopup;
