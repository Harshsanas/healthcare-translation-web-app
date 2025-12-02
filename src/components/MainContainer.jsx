import React, { useState, useEffect, useRef } from "react";
import LanguageSelector from "./LanguageSelector";
import Textarea from "./Textarea";
import LanguageSwap from "./LanguageSwap";

export default function MainContainer() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguage, setTargetLanguage] = useState("es-ES");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLanguage;

      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setSourceText(finalTranscriptRef.current + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sourceLanguage]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLanguage;
    }
  }, [sourceLanguage]);

  const handleTranslate = () => {
    if (isListening) {
      stopListening();
    }

    console.log("Translating:", {
      sourceText,
      sourceLanguage,
      targetLanguage,
    });
    setTranslatedText(
      `[Translated from ${sourceLanguage} to ${targetLanguage}]: ${sourceText}`
    );
  };

  const handleNewTranslation = () => {
    setSourceText("");
    setTranslatedText("");
    finalTranscriptRef.current = "";
    if (isListening) {
      stopListening();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        finalTranscriptRef.current = sourceText;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    const tempText = sourceText;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
    finalTranscriptRef.current = translatedText;
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-2 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto_2fr] gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">From</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {isListening ? "Listening..." : ""}
                  </span>
                  {isListening && (
                    <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
              <LanguageSelector
                label="Select Source Language"
                value={sourceLanguage}
                onChange={setSourceLanguage}
              />
              <div className="relative">
                <Textarea
                  label="Enter text to translate"
                  value={sourceText}
                  onChange={setSourceText}
                  placeholder="Type or paste your text here, or use the microphone..."
                  rows={8}
                  required={true}
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <LanguageSwap
                  onSwap={handleSwapLanguages}
                  disabled={isListening}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">To</h2>
              <LanguageSelector
                label="Translate language"
                value={targetLanguage}
                onChange={setTargetLanguage}
              />
              <Textarea
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleTranslate}
                disabled={!sourceText.trim()}
                className={`
                  flex items-center justify-center gap-2 
                  ${
                    !sourceText.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
                onClick={toggleSpeechRecognition}
                className={`
                  p-3 rounded-lg transition-colors flex items-center justify-center
                  ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600"
                      : speechSupported
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }
                  text-white
                  ${speechSupported ? "cursor-pointer" : "cursor-not-allowed"}
                `}
                title={
                  speechSupported
                    ? isListening
                      ? "Stop listening"
                      : "Start voice input"
                    : "Speech not supported"
                }
                disabled={!speechSupported}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isListening ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  )}
                </svg>
                {isListening && <span className="ml-2 text-sm">Stop</span>}
              </button>

              <button
                onClick={handleNewTranslation}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
                title="Start new translation"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
