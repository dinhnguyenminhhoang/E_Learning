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
