import React from "react";

const LanguageSwap = ({ onSwap, disabled = false }) => {
  return (
    <button
      onClick={onSwap}
      disabled={disabled}
      className={`
        p-3 rounded-full transition-colors
        ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
        }
      `}
      title="Swap languages"
    >
      <svg
        className="w-5 h-5 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </button>
  );
};

export default LanguageSwap;
