"use strict";

const express = require("express");
const router = express.Router();
const https = require("https");
const { authenticate } = require("../middlewares/auth");

// Proxy TTS from Google Translate
router.get("/speak", authenticate, async (req, res) => {
    try {
        const { text, lang = "en" } = req.query;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

        const request = https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://translate.google.com/"
            }
        }, (response) => {
            if (response.statusCode !== 200) {
                console.error(`[TTS] Google TTS returned status: ${response.statusCode}`);
                return res.status(500).json({ error: "TTS service unavailable" });
            }
            response.pipe(res);
        });

        request.on("error", (error) => {
            console.error("[TTS] Error:", error);
            res.status(500).json({ error: "TTS request failed" });
        });

    } catch (error) {
        console.error("[TTS] Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
