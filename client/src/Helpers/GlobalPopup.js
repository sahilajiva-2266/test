import { createPortal } from "react-dom";
import { useEffect } from "react";

const GlobalPopup = ({ isVisible, onClose, children }) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-xl p-6 shadow-lg relative w-full max-w-xl">
        <button
          className="absolute top-2 right-2 text-red-500 text-lg font-bold"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default GlobalPopup;
