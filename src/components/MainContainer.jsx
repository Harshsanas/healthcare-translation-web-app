import React from "react";
import LanguageSelector from "./LanguageSelector";
import TextArea from "./TextArea";

export default function MainContainer() {
  const [sourceText, setSourceText] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState("");
  const [sourceLanguage, setSourceLanguage] = React.useState("en-US");
  const [targetLanguage, setTargetLanguage] = React.useState("es-ES");

  const handleTranslate = () => {
    console.log("Translating:", {
      sourceText,
      sourceLanguage,
      targetLanguage,
    });
    setTranslatedText(
      `[Translated from ${sourceLanguage} to ${targetLanguage}]: ${sourceText}`
    );
  };

  const handleTextToSpeech = () => {
    console.log("Text to speech:", sourceText);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-2 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">From</h2>
              <LanguageSelector
                label="Select Source Language"
                value={sourceLanguage}
                onChange={setSourceLanguage}
              />
              <TextArea
                label="Enter text to translate"
                value={sourceText}
                onChange={setSourceText}
                placeholder="Type or paste your text here..."
                rows={8}
              />
            </div>

            {/* Target Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">To</h2>
              <LanguageSelector
                label="languageFrom"
                value={targetLanguage}
                onChange={setTargetLanguage}
              />
              <TextArea
                label="Translation"
                value={translatedText}
                onChange={setTranslatedText}
                placeholder="Translation will appear here..."
                readOnly
                rows={8}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTranslate}
                disabled={!sourceText.trim()}
                className={`
                  flex items-center justify-center gap-2 
                  ${
                    !sourceText.trim()
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                  text-white font-medium py-3 px-6 rounded-lg transition-colors
                `}
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
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10H11z"
                  />
                </svg>
                Translate
              </button>
              <button
                onClick={handleTextToSpeech}
                disabled={!sourceText.trim()}
                className={`
                  p-3 rounded-lg transition-colors
                  ${
                    !sourceText.trim()
                      ? "bg-red-400"
                      : "bg-red-500 hover:bg-red-600"
                  }
                  text-white
                `}
                title="Text to Speech"
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
