import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithGemini(message: string, language: string = 'en'): Promise<string> {
    try {
        const systemPrompts = {
            'en': `You are a helpful AI assistant for a civic issue reporting application called "Swatch Janta". 
You can help users with:
- Questions about how to report civic issues like drainage problems, potholes, garbage, etc.
- General information about civic services
- Navigation help within the app
- General conversation

Be friendly, concise, and helpful. Keep responses under 200 words. Always respond in English.`,
            'hi': `आप एक नागरिक मुद्दों की रिपोर्टिंग ऐप "स्वच्छ जनता" के लिए एक सहायक AI सहायक हैं।
आप उपयोगकर्ताओं की निम्नलिखित में मदद कर सकते हैं:
- जल निकासी की समस्याओं, गड्ढों, कचरा आदि जैसे नागरिक मुद्दों की रिपोर्ट करने के बारे में प्रश्न
- नागरिक सेवाओं के बारे में सामान्य जानकारी  
- ऐप के भीतर नेवीगेशन सहायता
- सामान्य बातचीत

मित्रवत, संक्षिप्त और सहायक रहें। उत्तर 200 शब्दों के अंदर रखें। हमेशा हिंदी में उत्तर दें।`,
            'pa': `ਤੁਸੀਂ ਇੱਕ ਸਿਵਿਲ ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟਿੰਗ ਐਪ "ਸਵਚੱ ਜਨਤਾ" ਲਈ ਇੱਕ ਸਹਾਇਕ AI ਸਹਾਇਕ ਹੋ।
ਤੁਸੀਂ ਉਪਯੋਗਕਰਤਾਵਾਂ ਦੀ ਇਹਨਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ:
- ਨਿਕਾਸੀ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ, ਟੋਏ, ਕੂੜਾ ਆਦਿ ਵਰਗੇ ਸਿਵਿਲ ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਬਾਰੇ ਸਵਾਲ
- ਸਿਵਿਲ ਸੇਵਾਵਾਂ ਬਾਰੇ ਆਮ ਜਾਣਕਾਰੀ
- ਐਪ ਦੇ ਅੰਦਰ ਨੇਵੀਗੇਸ਼ਨ ਮਦਦ  
- ਆਮ ਗੱਲਬਾਤ

ਮਿਤਰਵਤ, ਸੰਖੇਪ ਅਤੇ ਸਹਾਇਕ ਰਹੋ। ਜਵਾਬ 200 ਸ਼ਬਦਾਂ ਦੇ ਅੰਦਰ ਰੱਖੋ। ਹਮੇਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।`
        };

        const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts['en'];

        // Try with gemini-2.5-flash first, fallback to gemini-1.5-flash if overloaded
        let response;
        try {
            response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: systemPrompt,
                },
                contents: message,
            });
        } catch (primaryError: any) {
            if (primaryError.status === 503 || primaryError.message?.includes("overloaded")) {
                // Fallback to older model which might be less loaded
                response = await ai.models.generateContent({
                    model: "gemini-1.5-flash",
                    config: {
                        systemInstruction: systemPrompt,
                    },
                    contents: message,
                });
            } else {
                throw primaryError;
            }
        }

        return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error: any) {
        console.error("Gemini API error:", error);
        if (error.status === 503 || error.message?.includes("overloaded")) {
            return "I'm temporarily experiencing high demand. Please try again in a few moments!";
        }
        return "I'm experiencing technical difficulties. Please try again later.";
    }
}