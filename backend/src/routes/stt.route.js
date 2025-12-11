"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith("audio/") || file.mimetype === "application/octet-stream") {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed"), false);
        }
    }
});

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * POST /transcribe
 * Transcribe audio to text using Whisper
 */
router.post("/transcribe", authenticate, upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(
                ResponseBuilder.badRequest("Audio file is required")
            );
        }

        console.log(`[STT] Received audio: ${req.file.originalname}, size: ${req.file.size} bytes`);

        // Create form data to send to FastAPI using native FormData
        const formData = new FormData();
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("audio", audioBlob, req.file.originalname || "recording.webm");

        // Forward to FastAPI
        let response;
        try {
            response = await fetch(`${FASTAPI_URL}/api/v1/transcribe`, {
                method: "POST",
                body: formData
            });
        } catch (fetchError) {
            console.error(`[STT] Cannot connect to FastAPI server at ${FASTAPI_URL}:`, fetchError.message);
            return res.status(503).json(
                ResponseBuilder.error(
                    "FastAPI server is not running. Please start the AI server first.",
                    503,
                    `Make sure to run: cd Ai_project/APIServer && python -m uvicorn main:app --host 0.0.0.0 --port 8000`
                )
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[STT] FastAPI error: ${response.status} - ${errorText}`);
            throw new Error(`Transcription service error: ${response.status}`);
        }

        const result = await response.json();
        console.log(`[STT] Transcription result: ${result.transcribed_text}`);

        return res.json(
            ResponseBuilder.success("Transcription successful", {
                transcription: result.transcribed_text
            })
        );

    } catch (error) {
        console.error("[STT] Error:", error);
        return res.status(500).json(
            ResponseBuilder.error("Transcription failed", 500, error.message)
        );
    }
});

/**
 * POST /compare
 * Transcribe audio and compare with target word
 */
router.post("/compare", authenticate, upload.single("audio"), async (req, res) => {
    try {
        const { targetWord } = req.body;

        if (!req.file) {
            return res.status(400).json(
                ResponseBuilder.badRequest("Audio file is required")
            );
        }

        if (!targetWord) {
            return res.status(400).json(
                ResponseBuilder.badRequest("Target word is required")
            );
        }

        console.log(`[STT] Comparing pronunciation for: "${targetWord}"`);

        // Create form data to send to FastAPI using native FormData
        const formData = new FormData();
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("audio", audioBlob, req.file.originalname || "recording.webm");
        formData.append("target_word", targetWord);

        // Forward to FastAPI
        let response;
        try {
            response = await fetch(`${FASTAPI_URL}/api/v1/transcribe-and-compare`, {
                method: "POST",
                body: formData
            });
        } catch (fetchError) {
            console.error(`[STT] Cannot connect to FastAPI server at ${FASTAPI_URL}:`, fetchError.message);
            return res.status(503).json(
                ResponseBuilder.error(
                    "FastAPI server is not running. Please start the AI server first.",
                    503,
                    `Make sure to run: cd Ai_project/APIServer && python -m uvicorn main:app --host 0.0.0.0 --port 8000`
                )
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[STT] FastAPI error: ${response.status} - ${errorText}`);
            throw new Error(`Transcription service error: ${response.status}`);
        }

        const result = await response.json();
        console.log(`[STT] Comparison result: ${result.accuracy}% accuracy`);

        return res.json(
            ResponseBuilder.success("Pronunciation check complete", {
                transcription: result.transcribed_text,
                targetWord: result.target_word,
                accuracy: result.accuracy,
                isCorrect: result.is_correct
            })
        );

    } catch (error) {
        console.error("[STT] Error:", error);
        return res.status(500).json(
            ResponseBuilder.error("Pronunciation check failed", 500, error.message)
        );
    }
});

module.exports = router;
