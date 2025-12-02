export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
];

export const getTranslationCode = (speechCode) => {
  const mapping = {
    "en-US": "en",
    "es-ES": "es",
    "zh-CN": "zh",
    "hi-IN": "hi",
    "ar-SA": "ar",
    "fr-FR": "fr",
    "ru-RU": "ru",
    "pt-BR": "pt",
    "ja-JP": "ja",
    "ko-KR": "ko",
  };
  return mapping[speechCode] || "en";
};
