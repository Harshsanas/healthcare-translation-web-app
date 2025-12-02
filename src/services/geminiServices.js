import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUPPORTED_LANGUAGES } from "../utils/language";

class GeminiService {
    constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        // const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables");
            throw new Error("API key is required. Please add VITE_GEMINI_API_KEY to your .env file");
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp"
        });

        this.apiKey = apiKey;

        this.lastRequestTime = 0;
        this.minRequestInterval = 5000;
        this.requestWindow = []; 
        this.maxRequestsPerMinute = 12; 
    }

    async waitForRateLimit() {
        const now = Date.now();
        this.requestWindow = this.requestWindow.filter(time => now - time < 60000);
        if (this.requestWindow.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestWindow[0];
            const waitTime = 60000 - (now - oldestRequest) + 1000; // Extra 1 second buffer
            console.log(`⏳ Rate limit: ${this.requestWindow.length} requests in last minute. Waiting ${Math.ceil(waitTime / 1000)}s`);
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Re-check after waiting
            return this.waitForRateLimit();
        }

        // Also enforce minimum interval between requests
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`⏳ Minimum interval: waiting ${Math.ceil(waitTime / 1000)}s`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Record this request
        this.lastRequestTime = Date.now();
        this.requestWindow.push(this.lastRequestTime);
    }

    async translate(text, sourceLang, targetLang) {
        try {
            // Wait to respect rate limits
            await this.waitForRateLimit();

            const sourceLangName = this.getLanguageName(sourceLang);
            const targetLangName = this.getLanguageName(targetLang);

            // IMPROVED: Better prompt for medical context
            const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
This may contain medical terminology, so ensure accuracy for medical terms.
Provide only the translation without any additional text or explanations.

Text: "${text}"

Translation:`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Translation error:", error);

            if (error.message.includes("429")) {
                throw new Error("Rate limit exceeded. Free tier allows 15 requests per minute. Please wait 60 seconds and try again.");
            } else if (error.message.includes("404") || error.message.includes("not found")) {
                throw new Error("Model not available. Please verify your API key.");
            } else if (error.message.includes("API key") || error.message.includes("403")) {
                throw new Error("Invalid API key. Get a new key at https://aistudio.google.com/apikey");
            } else if (error.message.includes("PERMISSION_DENIED")) {
                throw new Error("API key doesn't have permission. Create a new key.");
            } else {
                throw new Error(`Translation failed: ${error.message}`);
            }
        }
    }

    /**
     * Detect language of given text (DISABLED to save API calls)
     * Returns null to let the UI keep current language
     * @param {string} text - Text to detect language
     * @returns {Promise<string|null>} Detected language code or null
     */
    async detectLanguage(text) {
        // DISABLED: Auto-detection uses too many API calls
        // Users can manually select the correct language instead
        console.log("Language auto-detection disabled to save API quota");
        return null;

        /* Original code - uncomment if you have paid tier
        try {
            await this.waitForRateLimit();
            
            const prompt = `Detect the language of this text. Return only the ISO 639-1 language code (2 letters).

Text: "${text.substring(0, 100)}"

Language code:`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().toLowerCase();
        } catch (error) {
            console.error("Language detection error:", error);
            return null;
        }
        */
    }

    /**
     * Get full language name from code
     * @param {string} code - Language code
     * @returns {string} Language name
     */
    getLanguageName(code) {
        const lang = SUPPORTED_LANGUAGES.find(l => l.geminiCode === code);
        return lang ? lang.name : code;
    }

    /**
     * Get rate limit status
     * @returns {object} Rate limit information
     */
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