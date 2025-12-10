"use strict";

const express = require("express");
const router = express.Router();
const AIService = require("../services/ai.service");
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");

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

module.exports = router;
