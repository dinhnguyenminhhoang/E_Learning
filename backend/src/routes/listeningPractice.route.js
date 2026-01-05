"use strict";

const express = require("express");
const router = express.Router();
const ResponseBuilder = require("../types/response/baseResponse");
const { authenticate } = require("../middlewares/auth");
const ListeningPracticeAttempt = require("../models/ListeningPracticeAttempt");

router.post("/submit", authenticate, async (req, res) => {
    try {
        const { blockId, lessonId, mediaTitle, questions, totalQuestions, correctAnswers } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json(ResponseBuilder.badRequest("Questions array is required"));
        }

        if (typeof totalQuestions !== 'number' || typeof correctAnswers !== 'number') {
            return res.status(400).json(ResponseBuilder.badRequest("totalQuestions and correctAnswers are required"));
        }

        const accuracy = totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        const score = accuracy;

        console.log(`[Listening Practice] User ${req.user._id} - Total: ${totalQuestions}, Correct: ${correctAnswers}, Accuracy: ${accuracy}%`);

        const practiceAttempt = await ListeningPracticeAttempt.create({
            user: req.user._id,
            blockId: blockId || null,
            lessonId: lessonId || null,
            mediaTitle: mediaTitle || null,
            questions: questions.map(q => ({
                question: q.question,
                userAnswer: q.userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect: q.isCorrect,
            })),
            totalQuestions,
            correctAnswers,
            accuracy,
            score,
            completedAt: new Date(),
        });

        console.log(`[Listening Practice] Saved to DB - ID: ${practiceAttempt._id}, Accuracy: ${accuracy}%`);

        return res.json(
            ResponseBuilder.success("Listening practice submitted successfully", {
                attemptId: practiceAttempt._id,
                accuracy,
                score,
                totalQuestions,
                correctAnswers,
            })
        );

    } catch (error) {
        console.error("[Listening Practice] Error:", error);
        return res.status(500).json(ResponseBuilder.error("Listening practice submission failed", 500, error.message));
    }
});

router.get("/stats", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        const totalAttempts = await ListeningPracticeAttempt.countDocuments({
            user: userId,
            status: "completed",
        });

        const attempts = await ListeningPracticeAttempt.find({
            user: userId,
            status: "completed",
        })
            .select("accuracy score completedAt")
            .sort({ completedAt: -1 })
            .limit(10)
            .lean();

        const avgAccuracy = attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length)
            : 0;

        return res.json(
            ResponseBuilder.success("Listening practice stats retrieved", {
                totalAttempts,
                avgAccuracy,
                recentAttempts: attempts,
            })
        );

    } catch (error) {
        console.error("[Listening Practice] Error getting stats:", error);
        return res.status(500).json(ResponseBuilder.error("Failed to get listening stats", 500, error.message));
    }
});

module.exports = router;
