import React, { useState, useEffect, useRef, useCallback } from "react";
import LanguageSelector from "./LanguageSelector";
import Textarea from "./Textarea";
import LanguageSwap from "./LanguageSwap";
import { geminiService } from "../services/geminiServices";
import {
  getGeminiCode,
  getSpeechCode,
  enhanceTranscript,
  MEDICAL_TERMS,
} from "../utils/language";

export default function MainContainer() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguage, setTargetLanguage] = useState("es-ES");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState("");
  const [medicalTermsDetected, setMedicalTermsDetected] = useState([]); // NEW

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

        // NEW: Enhance transcript with medical term corrections
        const rawText = finalTranscriptRef.current + interimTranscript;
        const enhancedText = enhanceTranscript(rawText);
        setSourceText(enhancedText);

        // NEW: Detect medical terms
        detectMedicalTerms(enhancedText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser");
      setSpeechSupported(false);
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

  // NEW: Function to detect medical terms in text
  const detectMedicalTerms = (text) => {
    const lowerText = text.toLowerCase();
    const detected = MEDICAL_TERMS.filter((term) =>
      lowerText.includes(term.toLowerCase())
    );
    setMedicalTermsDetected(detected);
  };

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsTranslating(true);
    setError("");
    setTranslatedText("Translating...");

    try {
      const sourceGeminiCode = getGeminiCode(sourceLanguage);
      const targetGeminiCode = getGeminiCode(targetLanguage);

      const translation = await geminiService.translate(
        sourceText,
        sourceGeminiCode,
        targetGeminiCode
      );

      setTranslatedText(translation);

      // Add rate limit status feedback
      const status = geminiService.getRateLimitStatus();
      if (status.remainingRequests < 5) {
        // Show warning when running low on requests
        console.warn(
          `Low on requests: ${status.remainingRequests} left this minute`
        );
      }
    } catch (error) {
      console.error("Translation error:", error);

      // More specific error messages
      let errorMessage =
        error.message || "Translation failed. Please try again.";

      if (errorMessage.includes("Rate limit exceeded")) {
        errorMessage =
          "Rate limit exceeded. Free tier allows 15 requests per minute. Please wait 60 seconds and try again.";
      } else if (errorMessage.includes("API key")) {
        errorMessage =
          "API key issue. Please check your Gemini API key configuration.";
      }

      setError(errorMessage);
      setTranslatedText("");
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, isListening]);

  const handleNewTranslation = () => {
    setSourceText("");
    setTranslatedText("");
    setError("");
    setMedicalTermsDetected([]); // NEW: Clear detected terms
    finalTranscriptRef.current = "";
    if (isListening) {
      stopListening();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      setError(
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
        setError("");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setError("Failed to start speech recognition");
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

  const handleSwapLanguages = async () => {
    if (isListening) {
      stopListening();
    }

    const tempLang = sourceLanguage;
    const tempText = sourceText;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
    finalTranscriptRef.current = translatedText;

    // NEW: Re-detect medical terms in swapped text
    detectMedicalTerms(translatedText);
  };

  const handleSourceTextChange = (text) => {
    // NEW: Enhance text and detect medical terms on manual input
    const enhancedText = enhanceTranscript(text);
    setSourceText(enhancedText);
    setError("");
    detectMedicalTerms(enhancedText);
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto_2fr] gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Source Text
                </h2>
                <div className="flex items-center gap-3">
                  {isListening && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-600">
                          Listening...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <LanguageSelector
                label="Source Language (Select manually)"
                value={sourceLanguage}
                onChange={setSourceLanguage}
                disabled={isListening || isTranslating}
              />

              <div className="relative">
                <Textarea
                  label="Enter text to translate"
                  value={sourceText}
                  onChange={handleSourceTextChange}
                  placeholder="Type or speak your text here..."
                  rows={10}
                  required={true}
                  disabled={isListening}
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* NEW: Medical terms indicator */}
              {medicalTermsDetected.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">🏥</span>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Medical terms detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {medicalTermsDetected.map((term, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <LanguageSwap
                  onSwap={handleSwapLanguages}
                  disabled={isListening || isTranslating}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Translated Text
              </h2>

              <LanguageSelector
                label="Target Language"
                value={targetLanguage}
                onChange={setTargetLanguage}
                disabled={isTranslating}
              />

              <Textarea
                label="Translation"
                value={translatedText}
                onChange={setTranslatedText}
                placeholder="Translation will appear here..."
                readOnly
                rows={10}
                className={`
                  border-2 transition-colors
                  ${
                    isTranslating
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }
                `}
              />

              {translatedText && !isTranslating && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      alert("Translation copied to clipboard!");
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Translation
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10 pt-8 border-t border-gray-200">
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim()}
              className={`
                flex items-center justify-center gap-3 px-3 py-2 rounded-xl
                transition-all transform hover:scale-105 active:scale-95
                ${
                  !sourceText.trim()
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }
                text-white font-semibold text-lg shadow-lg min-w-[200px]
              `}
            >
              {isTranslating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Translating...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
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
                  Translate Now
                </>
              )}
            </button>
            <button
              onClick={toggleSpeechRecognition}
              className={`
                    flex items-center justify-center gap-3 px-3 py-2 rounded-lg 
                    transition-all transform hover:scale-105 active:scale-95
                    ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600"
                        : speechSupported
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }
                    text-white font-medium shadow-md
                    ${speechSupported ? "cursor-pointer" : "cursor-not-allowed"}
                  `}
              disabled={!speechSupported || isTranslating}
            >
              <svg
                className="w-6 h-6"
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
            </button>

            <button
              onClick={handleNewTranslation}
              disabled={isTranslating || isListening}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium text-base rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg min-w-[180px]"
            >
              <svg
                className="w-6 h-6"
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
              New Translation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
