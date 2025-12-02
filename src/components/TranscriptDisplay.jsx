import React from "react";

export default function TranscriptDisplay({
  title,
  content,
  isActive,
  onSpeak,
  canSpeak,
  showWordCount = true,
}) {
  const wordCount = content
    ? content.split(/\s+/).filter((w) => w.length > 0).length
    : 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {isActive && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
          {title}
        </h3>
        {canSpeak && content && (
          <button
            onClick={onSpeak}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            Speak
          </button>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] max-h-[400px] overflow-y-auto border-2 border-gray-200">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
          {content || (
            <span className="text-gray-400 italic">
              Waiting for speech input...
            </span>
          )}
        </p>
      </div>
      {showWordCount && content && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>Words: {wordCount}</span>
          <span>Characters: {content.length}</span>
        </div>
      )}
    </div>
  );
}
