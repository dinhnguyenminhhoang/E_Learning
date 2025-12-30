"use strict";

const express = require("express");
const router = express.Router();
const AIService = require("../services/ai.service");
const GrammarNlpService = require("../services/grammarNlp.service");
const { SuccessResponse } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.post("/generate-word", authenticate, async (req, res) => {
    try {
        const { word } = req.body;

        if (!word || word.trim().length === 0) {
            return res.status(400).json(
                ResponseBuilder.badRequest("Word is required")
            );
        }

        console.log(`[AI] Generating word details for: "${word}"`);

        const result = await AIService.generateWordDetails(word.trim());

        return res.json(
            ResponseBuilder.success("Generated word details successfully", result)
        );
    } catch (error) {
        console.error("[AI] Error:", error);
        return res.status(500).json(
            ResponseBuilder.error("Failed to generate word details", 500, error.message)
        );
    }
});

router.post("/grade-writing", authenticate, asynchandler(async (req, res) => {
    const { text, language = "en-US" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new BadRequestError("Text is required");
    }

    try {
        const result = await GrammarNlpService.gradeWriting(text.trim(), language);

        const response = new SuccessResponse({
            message: "Writing graded successfully",
            metadata: result.data
        });

        return response.send(res);
    } catch (error) {
        console.error("[AI] Error grading writing:", error);

        const response = new SuccessResponse({
            message: "Writing grading failed",
            metadata: {
                grading: {
                    score: 0,
                    level: "Unknown",
                    overall_comment: `Lỗi khi chấm điểm: ${error.message}`,
                    suggestions: []
                },
                grammar_errors: []
            }
        });

        return response.send(res);
    }
}));

router.post("/grade-writing-gpt", authenticate, asynchandler(async (req, res) => {
    const { text, language = "en-US", topic, prompt } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new BadRequestError("Text is required");
    }

    try {
        const result = await AIService.gradeWriting(text.trim(), language, { topic, prompt });

        const response = new SuccessResponse({
            message: "Writing graded successfully with ChatGPT",
            metadata: result
        });

        return response.send(res);
    } catch (error) {
        console.error("[AI] Error grading writing with ChatGPT:", error);

        // Fallback or error response
        const response = new SuccessResponse({
            message: "Writing grading failed",
            metadata: {
                grading: {
                    score: 0,
                    level: "Unknown",
                    overall_comment: `Lỗi khi chấm điểm với AI: ${error.message}`,
                    suggestions: []
                },
                grammar_errors: []
            }
        });

        return response.send(res);
    }
}));

module.exports = router;
