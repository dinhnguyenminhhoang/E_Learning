"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");
const SpeakingPracticeAttempt = require("../models/SpeakingPracticeAttempt");

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("audio/") || file.mimetype === "application/octet-stream") {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed"), false);
        }
    }
});

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

router.post("/analyze", authenticate, upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(ResponseBuilder.badRequest("Audio file is required"));
        }

        const targetText = req.body.targetText || "";
        const templateId = req.body.templateId || null;
        console.log(`[Speaking Practice] Received audio: ${req.file.originalname}, size: ${req.file.size} bytes`);
        console.log(`[Speaking Practice] Target text: ${targetText}`);

        const formData = new FormData();
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("audio", audioBlob, req.file.originalname || "recording.webm");

        if (targetText) {
            formData.append("target_text", targetText);
        }

        let response;
        try {
            response = await fetch(`${FASTAPI_URL}/api/v1/speaking-practice`, {
                method: "POST",
                body: formData
            });
        } catch (fetchError) {
            console.error(`[Speaking Practice] Cannot connect to FastAPI server at ${FASTAPI_URL}:`, fetchError.message);
            return res.status(503).json(
                ResponseBuilder.error("FastAPI server is not running. Please start the AI server first.", 503)
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Speaking Practice] FastAPI error: ${response.status} - ${errorText}`);
            throw new Error(`Speaking practice service error: ${response.status}`);
        }

        const result = await response.json();
        console.log(`[Speaking Practice] Result - Transcribed: "${result.transcribed_text}", Accuracy: ${result.accuracy || "N/A"}, Score: ${result.grading?.score || "N/A"}`);

        // Save attempt to database for skill analysis tracking
        try {
            const attemptData = {
                user: req.user._id,
                prompt: targetText,
                transcription: result.transcribed_text,
                accuracy: result.accuracy || 0,
                score: result.grading?.score || 0,
                feedback: {
                    pronunciationScore: result.grading?.pronunciation_score,
                    overallFeedback: result.grading?.overall_comment,
                    suggestions: result.grading?.suggestions || [],
                },
                status: "completed",
                completedAt: new Date(),
            };

            if (templateId) {
                attemptData.templateId = templateId;
            }

            await SpeakingPracticeAttempt.create(attemptData);
            console.log(`[Speaking Practice] Attempt saved for user ${req.user._id}`);
        } catch (saveError) {
            console.error(`[Speaking Practice] Failed to save attempt:`, saveError.message);
            // Don't fail the request if saving fails
        }

        return res.json(
            ResponseBuilder.success("Speaking practice analysis complete", {
                transcribedText: result.transcribed_text,
                targetText: result.target_text,
                accuracy: result.accuracy,
                grading: result.grading
            })
        );

    } catch (error) {
        console.error("[Speaking Practice] Error:", error);
        return res.status(500).json(ResponseBuilder.error("Speaking practice analysis failed", 500, error.message));
    }
});

module.exports = router;
