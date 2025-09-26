import React from "react";

interface VpnModalProps {
  visible?: boolean;
  info: { title: string; text: string };
  setShow: (value: boolean) => void; // function from parent
}
const VpnPopup: React.FC<VpnModalProps> = ({ visible, info, setShow  }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">{info.title}</h2>
        <p className="text-gray-700 mb-6">
          {info.text}
        </p>
        <button
          onClick={() => setShow(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-md transition mb-4"
        >
          I Understand
        </button>
        <div className="bg-gray-100 p-2 rounded-md">
          <span>Need help? contact <b className="text-green-600 font-bold">Bi-Programmer</b></span>
        </div>
      </div>
    </div>
  );
};
export default VpnPopup;