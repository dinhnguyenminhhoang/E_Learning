"use strict";

const express = require("express");
const router = express.Router();
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");
const WritingPracticeAttempt = require("../models/WritingPracticeAttempt");

router.post("/submit", authenticate, async (req, res) => {
    try {
        const { templateId, prompt, userText, feedback } = req.body;

        if (!userText || typeof userText !== 'string') {
            return res.status(400).json(ResponseBuilder.badRequest("userText is required"));
        }

        const wordCount = userText.trim().split(/\s+/).length;
        const grammarErrorCount = feedback?.grammarErrors?.length || 0;
        const score = feedback?.score || Math.max(0, 100 - (grammarErrorCount * 5));

        console.log(`[Writing Practice] User ${req.user._id} - Words: ${wordCount}, Errors: ${grammarErrorCount}, Score: ${score}`);

        const practiceAttempt = await WritingPracticeAttempt.create({
            user: req.user._id,
            templateId: templateId || null,
            prompt: prompt || null,
            userText,
            feedback: feedback || {},
            grammarErrorCount,
            score,
            wordCount,
            completedAt: new Date(),
        });

        console.log(`[Writing Practice] Saved to DB - ID: ${practiceAttempt._id}, Score: ${score}`);

        return res.json(
            ResponseBuilder.success("Writing practice submitted successfully", {
                attemptId: practiceAttempt._id,
                score,
                wordCount,
                grammarErrorCount,
            })
        );

    } catch (error) {
        console.error("[Writing Practice] Error:", error);
        return res.status(500).json(ResponseBuilder.error("Writing practice submission failed", 500, error.message));
    }
});

router.get("/stats", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        const totalAttempts = await WritingPracticeAttempt.countDocuments({
            user: userId,
            status: "completed",
        });

        const attempts = await WritingPracticeAttempt.find({
            user: userId,
            status: "completed",
        })
            .select("score wordCount grammarErrorCount completedAt")
            .sort({ completedAt: -1 })
            .limit(10)
            .lean();

        const avgScore = attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : 0;

        const totalWords = attempts.reduce((sum, a) => sum + (a.wordCount || 0), 0);

        return res.json(
            ResponseBuilder.success("Writing practice stats retrieved", {
                totalAttempts,
                avgScore,
                totalWords,
                recentAttempts: attempts,
            })
        );

    } catch (error) {
        console.error("[Writing Practice] Error getting stats:", error);
        return res.status(500).json(ResponseBuilder.error("Failed to get writing stats", 500, error.message));
    }
});

module.exports = router;
