"use strict";

const OpenAI = require("openai");
const { Types } = require("mongoose");
const ChatHistory = require("../models/ChatHistory");

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

// Helper to convert userId to ObjectId
function toObjectId(id) {
    if (id instanceof Types.ObjectId) return id;
    return new Types.ObjectId(id);
}

// System prompt for English learning assistant
const SYSTEM_PROMPT = `Bạn là GuruLango - trợ lý học tiếng Anh thân thiện và nhiệt tình.

🎯 MỤC TIÊU CHÍNH: Hỗ trợ người dùng học tiếng Anh một cách hiệu quả.

✅ BẠN NÊN TRẢ LỜI các câu hỏi về:
- Từ vựng tiếng Anh (nghĩa, cách dùng, ví dụ, phát âm)
- Ngữ pháp (cấu trúc câu, thì, mạo từ, v.v.)
- Dịch thuật Anh-Việt và Việt-Anh
- Cách viết câu, đoạn văn tiếng Anh
- Phát âm và cách đọc
- Thành ngữ, cụm từ, collocations
- So sánh từ vựng (synonyms, antonyms)
- Bất kỳ câu hỏi nào liên quan đến việc học tiếng Anh

❌ CHỈ TỪ CHỐI khi câu hỏi HOÀN TOÀN không liên quan đến ngôn ngữ/học tập, ví dụ:
- Câu hỏi về chính trị, tôn giáo
- Yêu cầu viết code, lập trình
- Tin tức, thể thao, giải trí
- Các chủ đề nhạy cảm

📝 CÁCH TRẢ LỜI:
- Giải thích rõ ràng, dễ hiểu bằng tiếng Việt
- Luôn kèm ví dụ tiếng Anh cụ thể
- Khuyến khích và động viên người học
- Nếu không chắc câu hỏi có liên quan không, hãy CỐ GẮNG hỗ trợ trước`;

class AIAssistantService {
    async chat(userId, message, conversationId = null) {
        const userOid = toObjectId(userId);
        let conversation;

        if (conversationId) {
            try {
                conversation = await ChatHistory.findOne({
                    _id: new Types.ObjectId(conversationId),
                    userId: userOid,
                    isActive: true
                });
            } catch (err) {
                console.log("[AI Assistant] Invalid conversationId format, creating new conversation");
                conversation = null;
            }
        }

        if (!conversation) {
            conversation = await ChatHistory.createNewConversation(userOid);
        }

        conversation.messages.push({
            role: "user",
            content: message.trim(),
            timestamp: new Date()
        });

        const contextMessages = conversation.getRecentMessages(20);

        const chatMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...contextMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        const openai = getOpenAIClient();

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

        conversation.messages.push({
            role: "assistant",
            content: responseText,
            timestamp: new Date()
        });

        if (conversation.messages.filter(m => m.role === "user").length === 1) {
            conversation.title = message.length > 50
                ? message.substring(0, 50) + "..."
                : message;
        }

        await conversation.save();

        return {
            conversationId: conversation._id,
            message: {
                role: "assistant",
                content: responseText,
                tokensUsed: completion.usage?.total_tokens || 0
            }
        };
    }

    async correctGrammar(text) {
        try {
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
            console.error("[AIAssistantService] Grammar correction error:", error);
            throw new Error("Failed to check grammar with custom AI service.");
        }
    }

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
    }

    // Get user's conversations
    async getConversations(userId, limit = 20) {
        const userOid = toObjectId(userId);
        console.log(`[AI Assistant] Getting conversations for userId: ${userId} (ObjectId: ${userOid})`);
        const conversations = await ChatHistory.getUserConversations(userOid, limit);
        console.log(`[AI Assistant] Found ${conversations.length} conversations`);
        return conversations;
    }

    // Get single conversation
    async getConversation(userId, conversationId) {
        const conversation = await ChatHistory.findOne({
            _id: conversationId,
            userId: toObjectId(userId),
            isActive: true
        });

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        return conversation;
    }

    // Create new conversation
    async createConversation(userId, title = "Cuộc trò chuyện mới") {
        return await ChatHistory.createNewConversation(toObjectId(userId), title);
    }

    // Delete conversation (soft delete)
    async deleteConversation(userId, conversationId) {
        const conversation = await ChatHistory.findOneAndUpdate(
            { _id: conversationId, userId: toObjectId(userId) },
            { isActive: false },
            { new: true }
        );

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        return conversation;
    }
}

module.exports = new AIAssistantService();
