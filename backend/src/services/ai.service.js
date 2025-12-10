"use strict";

const OpenAI = require("openai");

let openaiClient = null;

function getOpenAIClient() {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables");
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

class AIService {
    // System prompt for English learning assistant
    getSystemPrompt() {
        return `Bạn là trợ lý học tiếng Anh thông minh tên GuruLango. Nhiệm vụ của bạn là:
1. CHỈ trả lời các câu hỏi liên quan đến học tiếng Anh (ngữ pháp, từ vựng, phát âm, dịch thuật, luyện viết, v.v.)
2. TỪ CHỐI LỊCH SỰ các câu hỏi KHÔNG liên quan đến học tiếng Anh (chính trị, game, tin tức, lập trình, v.v.)
3. Khi từ chối, hãy nói: "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến việc học tiếng Anh. Bạn có muốn hỏi về ngữ pháp, từ vựng, hoặc cần tôi giúp dịch gì không?"
4. Giải thích dễ hiểu, có ví dụ minh họa cụ thể
5. Sử dụng tiếng Việt khi giải thích, tiếng Anh cho ví dụ
6. Khuyến khích người dùng học tập và thực hành`;
    }

    // Chat with conversation history
    async chat(messages, userId = null) {
        const openai = getOpenAIClient();

        // Prepare messages with system prompt
        const chatMessages = [
            { role: "system", content: this.getSystemPrompt() },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: chatMessages,
                temperature: 0.7,
                max_tokens: 1000,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();

            if (!responseText) {
                throw new Error("Empty response from AI");
            }

            return {
                role: "assistant",
                content: responseText,
                tokensUsed: completion.usage?.total_tokens || 0
            };
        } catch (error) {
            console.error("[AIService] Chat error:", error);
            if (error.code === "insufficient_quota") {
                throw new Error("AI API quota exceeded. Please try again later.");
            }
            throw error;
        }
    }

    // Correct grammar and explain errors
    async correctGrammar(text) {
        try {
            // Call local FastAPI service
            const response = await fetch("http://localhost:8000/api/v1/correct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error(`FastAPI service error: ${response.statusText}`);
            }

            const data = await response.json();
            const correctedText = data.corrected_text;

            // Construct response format
            let explanation = "";
            if (text.trim() === correctedText.trim()) {
                explanation = "Câu này đã đúng ngữ pháp!";
            } else {
                explanation = "Đã sửa lỗi ngữ pháp và chính tả dựa trên mô hình AI.";
            }

            const content = `1. Câu gốc: ${text}\n2. Câu đã sửa: ${correctedText}\n3. Giải thích: ${explanation}`;

            return {
                role: "assistant",
                content: content,
                type: "grammar"
            };
        } catch (error) {
            console.error("[AIService] Grammar correction error:", error);
            throw error;
        }
    }

    // Explain vocabulary in detail
    async explainVocabulary(word, context = null) {
        const openai = getOpenAIClient();

        let prompt = `Giải thích chi tiết từ tiếng Anh "${word}"`;
        if (context) {
            prompt += ` trong ngữ cảnh: "${context}"`;
        }

        prompt += `

Trả lời theo format:
📝 Từ: ${word}
🔊 Phát âm: [IPA]
📚 Loại từ: [noun/verb/adj/...]
🇻🇳 Nghĩa: [nghĩa tiếng Việt]
✨ Ví dụ: [2-3 câu ví dụ với dịch]
🔗 Từ liên quan: [synonyms, antonyms]
💡 Mẹo nhớ: [cách nhớ từ dễ dàng]`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Bạn là từ điển tiếng Anh thông minh, giải thích từ vựng dễ hiểu." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 800,
            });

            return {
                role: "assistant",
                content: completion.choices[0]?.message?.content?.trim() || "",
                type: "vocabulary"
            };
        } catch (error) {
            console.error("[AIService] Vocabulary explanation error:", error);
            throw error;
        }
    }

    // Original word generation method (kept for backward compatibility)
    async generateWordDetails(word) {
        if (!word || word.trim().length === 0) {
            throw new Error("Word is required");
        }

        const openai = getOpenAIClient();

        const prompt = `Bạn là một từ điển Anh-Việt thông minh. Cho từ tiếng Anh "${word}", hãy trả về thông tin dưới dạng JSON với cấu trúc sau:
{
  "word": "${word}",
  "pronunciation": "phiên âm IPA (ví dụ: /ˈhæp.i.nəs/)",
  "meaningVi": "nghĩa tiếng Việt ngắn gọn",
  "type": "loại từ: noun, verb, adjective, adverb, phrase, hoặc other",
  "example": "1 câu ví dụ tiếng Anh tự nhiên",
  "exampleVi": "dịch câu ví dụ sang tiếng Việt",
  "level": "đánh giá độ khó: beginner, intermediate, hoặc advanced"
}

CHỈ trả về JSON, không có text khác.`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một từ điển Anh-Việt. Luôn trả về JSON hợp lệ, không có markdown code blocks."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();

            if (!responseText) {
                throw new Error("Empty response from AI");
            }

            // Clean up response - remove markdown code blocks if present
            let cleanedResponse = responseText;
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.slice(7);
            }
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.slice(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.slice(0, -3);
            }
            cleanedResponse = cleanedResponse.trim();

            const result = JSON.parse(cleanedResponse);

            return {
                word: result.word || word,
                pronunciation: result.pronunciation || "",
                meaningVi: result.meaningVi || "",
                type: result.type || "other",
                example: result.example || "",
                exampleVi: result.exampleVi || "",
                level: result.level || "intermediate",
            };
        } catch (error) {
            console.error("[AIService] Error generating word details:", error);

            if (error.code === "insufficient_quota") {
                throw new Error("AI API quota exceeded. Please try again later.");
            }

            if (error instanceof SyntaxError) {
                throw new Error("Failed to parse AI response");
            }

            throw error;
        }
    }
}

module.exports = new AIService();
