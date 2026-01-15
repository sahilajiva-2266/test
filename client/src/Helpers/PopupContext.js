// context/PopupContext.js
import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popupContent, setPopupContent] = useState(null);
  const [popupWidth, setPopupWidth] = useState("md");
  const [popupHeight, setPopupHeight] = useState("auto");
  const [isTransparent, setIsTransparent] = useState(false);
  const [position, setPosition] = useState("center");

  const openPopup = (content, options = {}) => {
    setPopupContent(content);
    setPopupWidth(options.width || "md");
    setPopupHeight(options.height || "auto");
    setIsTransparent(!!options.transparent);
    setPosition(options.position || "center");
  };

  const closePopup = () => {
    setPopupContent(null);
    setPopupWidth("md");
    setPopupHeight("auto");
    setIsTransparent(false);
    setPosition("center");
  };

  const widthClass =
    {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-3xl",
      full: "w-full mx-4 md:mx-10",
    }[popupWidth] || popupWidth;

  const heightClass =
    {
      sm: "max-h-[300px] overflow-y-auto",
      md: "max-h-[500px] overflow-y-auto",
      lg: "max-h-[700px] overflow-y-auto",
      full: "h-full",
      auto: "",
    }[popupHeight] || popupHeight;

  const alignmentClass = {
    center: "justify-center items-center",
    left: "justify-start items-center pl-4",
    right: "justify-end items-center pr-4",
  }[position];

  return (
    <PopupContext.Provider value={{ openPopup, closePopup }}>
      {children}
      {popupContent && (
        <div
          className={`AJ-popup fixed inset-0 z-[9999] flex ${alignmentClass} ${
            isTransparent ? "bg-black bg-opacity-0" : "bg-black bg-opacity-40"
          }`}
        >
          <div
            className={`bg-white rounded shadow-lg relative overflow-y-auto AJ-crm-popup ${
              popupWidth === "full" && popupHeight === "full"
                ? "w-full h-full"
                : "p-6"
            } ${widthClass} ${heightClass}`}
          >
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-red-500 font-bold text-xl z-10"
            >
              ×
            </button>
            <div className="AJ-popup-content">{popupContent}</div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};
