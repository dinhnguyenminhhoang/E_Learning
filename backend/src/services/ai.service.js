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
    getSystemPrompt() {
        return `Bạn là trợ lý học tiếng Anh thông minh tên GuruLango. Nhiệm vụ của bạn là:
1. CHỈ trả lời các câu hỏi liên quan đến học tiếng Anh (ngữ pháp, từ vựng, phát âm, dịch thuật, luyện viết, v.v.)
2. TỪ CHỐI LỊCH SỰ các câu hỏi KHÔNG liên quan đến học tiếng Anh (chính trị, game, tin tức, lập trình, v.v.)
3. Khi từ chối, hãy nói: "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến việc học tiếng Anh. Bạn có muốn hỏi về ngữ pháp, từ vựng, hoặc cần tôi giúp dịch gì không?"
4. Giải thích dễ hiểu, có ví dụ minh họa cụ thể
5. Sử dụng tiếng Việt khi giải thích, tiếng Anh cho ví dụ
6. Khuyến khích người dùng học tập và thực hành`;
    }

    async chat(messages, userId = null) {
        const openai = getOpenAIClient();

        const chatMessages = [
            { role: "system", content: this.getSystemPrompt() },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
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

    async correctGrammar(text) {
        try {
            const response = await fetch("http://localhost:8000/api/v1/correct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            console.error("[AIService] Grammar correction error:", error);
            throw error;
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

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
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
                model: "gpt-4o",
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

    async generateWritingTemplates({ count = 5, level = "medium", type = "essay" }) {
        const openai = getOpenAIClient();

        const prompt = `Generate ${count} creative and diverse English writing practice templates for ESL learners.

Requirements:
- Level: ${level} (easy = A2-B1, medium = B1-B2, hard = B2-C1)
- Type: ${type}
- Each template should have:
  * Engaging and practical title
  * Clear writing prompt/task
  * Appropriate word count range
  * Optional hints to guide the writer

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "title": "English title",
    "titleVi": "Vietnamese title",
    "prompt": "Detailed writing task in English",
    "promptVi": "Detailed writing task in Vietnamese",
    "level": "${level}",
    "type": "${type}",
    "category": "topic category (Education, Technology, Environment, etc)",
    "minWords": 100-300 (adjust based on level),
    "maxWords": 200-500 (adjust based on level),
    "hints": ["hint 1", "hint 2", "hint 3"],
    "sampleAnswer": "A brief sample answer showing the expected structure and style"
  }
]

Make topics diverse, relevant to modern life, and engaging for language learners.`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert English teacher creating writing practice materials. Return only valid JSON arrays without markdown formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 3000,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();

            if (!responseText) {
                throw new Error("Empty response from AI");
            }

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

            const templates = JSON.parse(cleanedResponse);

            if (!Array.isArray(templates)) {
                throw new Error("AI response is not an array");
            }

            return templates;
        } catch (error) {
            console.error("[AIService] Error generating writing templates:", error);

            if (error.code === "insufficient_quota") {
                throw new Error("AI API quota exceeded. Please try again later.");
            }

            if (error instanceof SyntaxError) {
                throw new Error("Failed to parse AI response. Please try again.");
            }

            throw error;
        }
    }

    async generateSpeakingTemplates({ count = 10, level = "medium", type = "sentence" }) {
        const openai = getOpenAIClient();

        const prompt = `Generate ${count} English speaking practice templates for ESL learners.

Requirements:
- Level: ${level} (easy = A1-A2, medium = B1-B2, hard = B2-C1)
- Type: ${type} (word = single words or short phrases, sentence = complete sentences)
- Each template should have:
  * Natural, conversational English text
  * Vietnamese translation
  * Appropriate difficulty for the level

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "text": "English ${type === 'word' ? 'word/phrase' : 'sentence'}",
    "textVi": "Vietnamese translation",
    "level": "${level}",
    "type": "${type}",
    "category": "topic category (Greetings, Daily Life, Business, etc)",
    "order": 0
  }
]

Make content diverse, practical, and useful for daily communication.`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert English teacher creating speaking practice materials. Return only valid JSON arrays without markdown formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 2000,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();

            if (!responseText) {
                throw new Error("Empty response from AI");
            }

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

            const templates = JSON.parse(cleanedResponse);

            if (!Array.isArray(templates)) {
                throw new Error("AI response is not an array");
            }

            return templates;
        } catch (error) {
            console.error("[AIService] Error generating speaking templates:", error);

            if (error.code === "insufficient_quota") {
                throw new Error("AI API quota exceeded. Please try again later.");
            }

            if (error instanceof SyntaxError) {
                throw new Error("Failed to parse AI response. Please try again.");
            }

            throw error;
        }
    }
    async gradeWriting(text, language = "en-US", context = {}) {
        const openai = getOpenAIClient();
        const { topic, prompt: writingPrompt } = context;

        let systemPrompt = "You are an expert English teacher. Grade the following writing sample.";
        if (topic) systemPrompt += ` The topic is: "${topic}".`;
        if (writingPrompt) systemPrompt += ` The specific prompt is: "${writingPrompt}".`;

        const userPrompt = `Writing Sample:
"${text}"

Evaluate the writing based on grammar, vocabulary, coherence, and relevance to the topic/prompt.

STRICT SCORING RULES:
1. If the text is less than 20 words, the MAXIMUM score is 10.
2. If the text is irrelevant to the topic/prompt, the MAXIMUM score is 20.
3. CRITICAL: If the text is identical or nearly identical to the prompt "${writingPrompt}", the score MUST be 0.
4. If the text is gibberish or nonsensical, the score MUST be 0.
5. CRITICAL: The writing MUST be in English. If the user writes in Vietnamese or any other language, the score MUST be 0.
6. Deduct points heavily for spelling and grammar errors, especially in short texts.
7. Be strict. Do not give high scores for poor quality work.

Return a JSON object with this structure:
{
  "grammar_errors": [
    {
      "message": "Explanation of the error",
      "shortMessage": "Short error label",
      "replacements": [{"value": "correction"}],
      "error_text": "The exact text segment that is incorrect (must match exactly with the text in the sample)"
    }
  ],
  "grading": {
    "score": 0-100,
    "level": "A1/A2/B1/B2/C1/C2",
    "overall_comment": "Overall feedback in Vietnamese. Mention if the writing is off-topic or too short.",
    "suggestions": ["Suggestion 1 in Vietnamese", "Suggestion 2 in Vietnamese"],
    "detailed_analysis": {
      "vocabulary": { "score": 0-10, "comment": "Feedback on vocabulary usage" },
      "grammar": { "score": 0-10, "comment": "Feedback on grammar accuracy" },
      "coherence": { "score": 0-10, "comment": "Feedback on flow and structure" },
      "relevance": { "score": 0-10, "comment": "Feedback on addressing the prompt" }
    },
    "improvement_plan": "A detailed paragraph in Vietnamese suggesting what the user should study next to improve (e.g., specific grammar points, vocabulary topics).",
    "translated_text": "Vietnamese translation of the user's writing sample."
  }
}
If there are no errors, "grammar_errors" should be empty.
IMPORTANT: The "error_text" MUST be the exact substring from the original text so I can find its position.`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert English teacher. Return only valid JSON."
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();
            if (!responseText) throw new Error("Empty response from AI");

            let cleanedResponse = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const result = JSON.parse(cleanedResponse);

            // Post-process to find offsets
            if (result.grammar_errors) {
                result.grammar_errors = result.grammar_errors.map(error => {
                    const offset = text.indexOf(error.error_text);
                    return {
                        ...error,
                        offset: offset !== -1 ? offset : 0,
                        length: error.error_text ? error.error_text.length : 0
                    };
                });
            }

            return result;
        } catch (error) {
            console.error("[AIService] Error grading writing:", error);
            throw error;
        }
    }

    async generateBlockContent({ type, title, difficulty = "intermediate", skill = "reading" }) {
        const openai = getOpenAIClient();

        const prompts = {
            grammar: `Generate content for an English grammar lesson block titled "${title}".

Requirements:
- Level: ${difficulty} (beginner = A1-A2, intermediate = B1-B2, advanced = B2-C1)
- Skill focus: ${skill}
- Create comprehensive grammar learning content

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "topic": "Grammar topic name in English",
  "description": "Brief description in Vietnamese (1-2 sentences)",
  "explanation": "Detailed explanation in Vietnamese with clear examples",
  "examples": [
    "English example sentence 1 - Dịch tiếng Việt",
    "English example sentence 2 - Dịch tiếng Việt",
    "English example sentence 3 - Dịch tiếng Việt"
  ],
  "videoUrl": "YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID) - find relevant grammar tutorial video, if none suitable use empty string"
}

Make content educational, clear, and practical for Vietnamese learners.`,

            vocabulary: `Generate content for an English vocabulary lesson block titled "${title}".

Requirements:
- Level: ${difficulty} (beginner = A1-A2, intermediate = B1-B2, advanced = B2-C1)
- Skill focus: ${skill}
- Create comprehensive vocabulary learning content

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "description": "Brief description in Vietnamese (1-2 sentences) explaining what vocabulary will be learned",
  "suggestedWords": [
    {"word": "word1", "meaning": "nghĩa tiếng Việt", "partOfSpeech": "noun/verb/adj/etc"},
    {"word": "word2", "meaning": "nghĩa tiếng Việt", "partOfSpeech": "noun/verb/adj/etc"},
    {"word": "word3", "meaning": "nghĩa tiếng Việt", "partOfSpeech": "noun/verb/adj/etc"},
    (suggest 10-15 words total)
  ]
}

Make vocabulary practical, relevant to the title topic, and appropriate for the level.`,

            media: `Generate content for an English media lesson block titled "${title}".

Requirements:
- Level: ${difficulty} (beginner = A1-A2, intermediate = B1-B2, advanced = B2-C1)
- Skill focus: ${skill}
- Create comprehensive media learning content

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "description": "Brief description in Vietnamese (1-2 sentences) about the media content",
  "sourceUrl": "YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID) - find relevant English learning video matching the title and level",
  "transcript": "Brief summary or key points from the video in Vietnamese (3-5 sentences)",
  "tasks": [
    {"question": "Comprehension question 1 in Vietnamese", "answer": "Expected answer"},
    {"question": "Comprehension question 2 in Vietnamese", "answer": "Expected answer"},
    {"question": "Comprehension question 3 in Vietnamese", "answer": "Expected answer"}
  ]
}

Make content engaging and appropriate for ${skill} skill development.`,

            quiz: `Generate content for an English quiz block titled "${title}".

Requirements:
- Level: ${difficulty} (beginner = A1-A2, intermediate = B1-B2, advanced = B2-C1)
- Skill focus: ${skill}
- Create a comprehensive quiz

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "description": "Brief description in Vietnamese (1-2 sentences) about what the quiz tests",
  "suggestedQuestions": [
    {
      "question": "Question text in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation in Vietnamese why this is correct"
    }
    (generate 5-10 questions)
  ]
}

Make questions clear, educational, and appropriate for the level.`
        };

        const prompt = prompts[type];
        if (!prompt) {
            throw new Error(`Unsupported block type: ${type}`);
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert English teacher creating educational content. Return only valid JSON without markdown formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();

            if (!responseText) {
                throw new Error("Empty response from AI");
            }

            // Clean up response
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

            return result;
        } catch (error) {
            console.error("[AIService] Error generating block content:", error);

            if (error.code === "insufficient_quota") {
                throw new Error("AI API quota exceeded. Please try again later.");
            }

            if (error instanceof SyntaxError) {
                throw new Error("Failed to parse AI response. Please try again.");
            }

            throw error;
        }
    }
}

module.exports = new AIService();
