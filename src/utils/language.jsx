export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸", geminiCode: "en" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸", geminiCode: "es" },
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳", geminiCode: "zh" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳", geminiCode: "hi" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦", geminiCode: "ar" },
  { code: "fr-FR", name: "French", flag: "🇫🇷", geminiCode: "fr" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺", geminiCode: "ru" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷", geminiCode: "pt" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵", geminiCode: "ja" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷", geminiCode: "ko" },
  { code: "de-DE", name: "German", flag: "🇩🇪", geminiCode: "de" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹", geminiCode: "it" },
  { code: "nl-NL", name: "Dutch", flag: "🇳🇱", geminiCode: "nl" },
  { code: "tr-TR", name: "Turkish", flag: "🇹🇷", geminiCode: "tr" },
  { code: "pl-PL", name: "Polish", flag: "🇵🇱", geminiCode: "pl" },
  { code: "vi-VN", name: "Vietnamese", flag: "🇻🇳", geminiCode: "vi" },
  { code: "th-TH", name: "Thai", flag: "🇹🇭", geminiCode: "th" },
  { code: "id-ID", name: "Indonesian", flag: "🇮🇩", geminiCode: "id" },
  { code: "he-IL", name: "Hebrew", flag: "🇮🇱", geminiCode: "he" },
  { code: "sv-SE", name: "Swedish", flag: "🇸🇪", geminiCode: "sv" },
];

/**
 * Convert speech recognition code to Gemini language code
 */
export const getGeminiCode = (speechCode) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === speechCode);
  return lang ? lang.geminiCode : "en";
};

/**
 * Convert Gemini code to speech recognition code
 */
export const getSpeechCode = (geminiCode) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.geminiCode === geminiCode);
  return lang ? lang.code : "en-US";
};

export const getLanguageName = (code) => {
  let lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (!lang) {
    lang = SUPPORTED_LANGUAGES.find((l) => l.geminiCode === code);
  }
  return lang ? lang.name : "Unknown";
};

// Common medical terms for enhanced recognition
export const MEDICAL_TERMS = [
  "hypertension",
  "diabetes",
  "asthma",
  "prescription",
  "medication",
  "symptoms",
  "diagnosis",
  "treatment",
  "allergy",
  "blood pressure",
  "heart rate",
  "temperature",
  "nausea",
  "fever",
  "cough",
  "headache",
  "pain",
  "doctor",
  "nurse",
  "pharmacy",
  "emergency",
  "insurance",
  "appointment",
  "vaccination",
  "surgery",
  "anesthesia",
  "antibiotic",
  "dosage",
  "side effects",
  // Additional medical terms
  "chronic",
  "acute",
  "infection",
  "inflammation",
  "respiratory",
  "cardiac",
  "neurological",
  "diabetic",
  "hypertensive",
  "allergic",
  "symptomatic",
  "condition",
];

// IMPROVED: Enhance transcript with medical term recognition
export const enhanceTranscript = (text) => {
  let enhanced = text;

  // Common misheard medical terms corrections
  const corrections = {
    // Hypertension variations
    "hi pertension": "hypertension",
    hippertension: "hypertension",
    "high pertension": "hypertension",
    "hyper tension": "hypertension",

    // Diabetes variations
    "die a beaties": "diabetes",
    diabeties: "diabetes",
    "die beaties": "diabetes",
    dieabeties: "diabetes",

    // Asthma variations
    "as ma": "asthma",
    azma: "asthma",
    asmah: "asthma",

    // Prescription variations
    "pre scription": "prescription",
    priscription: "prescription",

    // Medication variations
    "medi cation": "medication",
    medacation: "medication",
    medicashun: "medication",

    // Allergy variations
    "aller gy": "allergy",
    alergie: "allergy",
    allergee: "allergy",

    // Temperature variations
    "temp rature": "temperature",
    tempature: "temperature",
    temperture: "temperature",

    // Blood pressure
    "blood presure": "blood pressure",
    bloodpressure: "blood pressure",

    // Symptoms
    simptoms: "symptoms",
    symptums: "symptoms",

    // Diagnosis
    diagnoses: "diagnosis",
    diagnosys: "diagnosis",

    // Antibiotic
    "anti biotic": "antibiotic",
    antibyotic: "antibiotic",

    // Vaccination
    vaxination: "vaccination",
    vacination: "vaccination",
  };

  // Apply corrections (case-insensitive)
  Object.keys(corrections).forEach((wrong) => {
    const regex = new RegExp(wrong, "gi");
    enhanced = enhanced.replace(regex, corrections[wrong]);
  });

  return enhanced;
};

// Context markers for medical conversations
export const MEDICAL_CONTEXT_MARKERS = [
  "hurt",
  "pain",
  "sick",
  "medicine",
  "doctor",
  "hospital",
  "feeling",
  "symptom",
  "treatment",
  "help",
  "ill",
  "ache",
  "sore",
  "injury",
  "wound",
  "health",
  "medical",
  "clinic",
];

export const isMedicalContext = (text) => {
  const lowerText = text.toLowerCase();
  return MEDICAL_CONTEXT_MARKERS.some((marker) => lowerText.includes(marker));
};
