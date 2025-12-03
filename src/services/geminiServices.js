import { SUPPORTED_LANGUAGES } from "../utils/language";

class GeminiService {
    constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        this.API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        this.requestWindow = [];
        this.maxRequestsPerMinute = 15;

        console.log("✅ Gemini service initialized with direct API");
    }

    async waitForRateLimit() {
        const now = Date.now();

        this.requestWindow = this.requestWindow.filter(time => now - time < 60000);

        if (this.requestWindow.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestWindow[0];
            const timeToWait = 60000 - (now - oldestRequest);
            console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(timeToWait / 1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, timeToWait));
            this.requestWindow = [];
        }

        if (this.lastRequestTime && (now - this.lastRequestTime) < this.minRequestInterval) {
            const timeToWait = this.minRequestInterval - (now - this.lastRequestTime);
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        this.lastRequestTime = Date.now();
        this.requestWindow.push(this.lastRequestTime);

        const status = this.getRateLimitStatus();
        console.log(`📊 Rate limit: ${status.requestsInLastMinute}/${this.maxRequestsPerMinute} requests this minute`);
    }

    async translate(text, sourceLang, targetLang) {
        try {
            await this.waitForRateLimit();

            const sourceLangName = this.getLanguageName(sourceLang);
            const targetLangName = this.getLanguageName(targetLang);

            const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
This may contain medical terminology, so ensure accuracy for medical terms.
Provide only the translation without any additional text or explanations.

Text: "${text}"

Translation:`;

            console.log("🌐 Translating:", text.substring(0, 50) + "...");

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let translation = "";
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                translation = data.candidates[0].content.parts[0].text.trim();
            } else {
                console.warn("Unexpected response format:", data);
                throw new Error("Unexpected response format from Gemini API");
            }

            console.log("✅ Translation successful");
            return translation;

        } catch (error) {
            console.error("❌ Translation error:", error);
            throw this.handleApiError(error);
        }
    }

    handleApiError(error) {
        console.error("API Error details:", error.message);

        if (error.message.includes("429")) {
            return new Error("Rate limit exceeded. Please wait 60 seconds and try again.");
        } else if (error.message.includes("400")) {
            return new Error("Invalid request. Please check your API key permissions.");
        } else if (error.message.includes("403")) {
            return new Error("API key doesn't have permission.");
        } else if (error.message.includes("API key")) {
            return new Error("Invalid API key format.");
        } else if (error.message.includes("quota") || error.message.includes("exceeded")) {
            return new Error("API quota exceeded.");
        } else {
            return new Error(`Translation failed: ${error.message || 'Unknown error'}`);
        }
    }

    async detectLanguage(text) {
        console.log("Language auto-detection disabled to save API quota");
        return null;
    }

    getLanguageName(code) {
        const lang = SUPPORTED_LANGUAGES.find(l => l.geminiCode === code);
        return lang ? lang.name : code;
    }

    getRateLimitStatus() {
        const now = Date.now();
        const recentRequests = this.requestWindow.filter(time => now - time < 60000);
        return {
            requestsInLastMinute: recentRequests.length,
            maxRequestsPerMinute: this.maxRequestsPerMinute,
            remainingRequests: Math.max(0, this.maxRequestsPerMinute - recentRequests.length),
            timeSinceLastRequest: this.lastRequestTime ? now - this.lastRequestTime : null
        };
    }
}

export const geminiService = new GeminiService();