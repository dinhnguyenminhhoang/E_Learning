"use strict";

const User = require("../models/User");
const Word = require("../models/Word");
const Category = require("../models/Category");
const CardDeck = require("../models/CardDeck");
const LearningPath = require("../models/LearningPath");
const Lesson = require("../models/Lessson");
const Quiz = require("../models/Quiz");
const Exam = require("../models/Exam");
const ResponseBuilder = require("../types/response/baseResponse");

class AnalyticsService {
    // Overview stats for dashboard cards
    async getOverviewStats() {
        const [
            totalUsers,
            activeUsers,
            totalWords,
            totalCategories,
            totalCardDecks,
            totalLearningPaths,
            totalLessons,
            totalQuizzes,
            totalExams,
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ status: 'active' }),
            Word.countDocuments({ status: { $ne: 'deleted' } }),
            Category.countDocuments({ status: { $ne: 'deleted' } }),
            CardDeck.countDocuments({ status: { $ne: 'deleted' } }),
            LearningPath.countDocuments({ status: { $ne: 'deleted' } }),
            Lesson.countDocuments({ status: { $ne: 'deleted' } }),
            Quiz.countDocuments({ status: { $ne: 'deleted' } }),
            Exam.countDocuments({ status: { $ne: 'deleted' } }),
        ]);

        // Get counts from last month for comparison
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [
            usersLastMonth,
            wordsLastMonth,
            lessonsLastMonth,
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $lt: lastMonth } }),
            Word.countDocuments({ createdAt: { $lt: lastMonth }, status: { $ne: 'deleted' } }),
            Lesson.countDocuments({ createdAt: { $lt: lastMonth }, status: { $ne: 'deleted' } }),
        ]);

        const calcChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return ResponseBuilder.success("Analytics fetched successfully", {
            overview: {
                totalUsers,
                activeUsers,
                totalWords,
                totalCategories,
                totalCardDecks,
                totalLearningPaths,
                totalLessons,
                totalQuizzes,
                totalExams,
            },
            changes: {
                usersChange: calcChange(totalUsers, usersLastMonth),
                wordsChange: calcChange(totalWords, wordsLastMonth),
                lessonsChange: calcChange(totalLessons, lessonsLastMonth),
            },
        });
    }

    // User registration trend (last 7 days, 30 days, etc.)
    async getUserTrend(period = 7) {
        const days = parseInt(period) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const users = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill missing dates with 0
        const result = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toISOString().split("T")[0];
            const found = users.find((u) => u._id === dateStr);
            result.push({
                date: dateStr,
                count: found ? found.count : 0,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            });
        }

        return ResponseBuilder.success("User trend fetched", { trend: result, period: days });
    }

    // Content distribution (words by level, category distribution)
    async getContentDistribution() {
        const [wordsByLevel, wordsByCategory, lessonsByStatus] = await Promise.all([
            Word.aggregate([
                { $match: { status: { $ne: 'deleted' } } },
                { $group: { _id: "$level", count: { $sum: 1 } } },
            ]),
            Word.aggregate([
                { $match: { status: { $ne: 'deleted' } } },
                { $unwind: "$categories" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categories",
                        foreignField: "_id",
                        as: "categoryInfo",
                    },
                },
                { $unwind: "$categoryInfo" },
                { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
            Lesson.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        return ResponseBuilder.success("Content distribution fetched", {
            wordsByLevel: wordsByLevel.map((w) => ({
                name: w._id || 'Unknown',
                value: w.count,
            })),
            wordsByCategory: wordsByCategory.map((w) => ({
                name: w._id || 'Uncategorized',
                value: w.count,
            })),
            lessonsByStatus: lessonsByStatus.map((l) => ({
                name: l._id || 'Unknown',
                value: l.count,
            })),
        });
    }

    // Recent activity
    async getRecentActivity(limit = 10) {
        const [recentWords, recentUsers, recentLessons] = await Promise.all([
            Word.find({ status: { $ne: 'deleted' } })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .select('word level createdAt')
                .lean(),
            User.find({})
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .select('name email createdAt')
                .lean(),
            Lesson.find({ status: { $ne: 'deleted' } })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .select('title status createdAt')
                .lean(),
        ]);

        return ResponseBuilder.success("Recent activity fetched", {
            recentWords,
            recentUsers,
            recentLessons,
        });
    }

    // Quiz & Exam statistics
    async getAssessmentStats() {
        const [quizStats, examStats] = await Promise.all([
            Quiz.aggregate([
                { $match: { status: { $ne: 'deleted' } } },
                {
                    $group: {
                        _id: "$difficulty",
                        count: { $sum: 1 },
                        avgQuestions: { $avg: { $size: { $ifNull: ["$questions", []] } } },
                    },
                },
            ]),
            Exam.aggregate([
                { $match: { status: { $ne: 'deleted' } } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        return ResponseBuilder.success("Assessment stats fetched", {
            quizzesByDifficulty: quizStats.map((q) => ({
                name: q._id || 'Unknown',
                count: q.count,
                avgQuestions: Math.round(q.avgQuestions || 0),
            })),
            examsByStatus: examStats.map((e) => ({
                name: e._id || 'Unknown',
                count: e.count,
            })),
        });
    }

    // Learning path progress summary
    async getLearningPathStats() {
        const stats = await LearningPath.aggregate([
            { $match: { status: { $ne: 'deleted' } } },
            {
                $lookup: {
                    from: "lessons",
                    localField: "levels.lessons",
                    foreignField: "_id",
                    as: "lessonDetails",
                },
            },
            {
                $project: {
                    title: 1,
                    levelCount: { $size: { $ifNull: ["$levels", []] } },
                    lessonCount: { $size: { $ifNull: ["$lessonDetails", []] } },
                    status: 1,
                },
            },
            { $sort: { lessonCount: -1 } },
            { $limit: 10 },
        ]);

        return ResponseBuilder.success("Learning path stats fetched", {
            topLearningPaths: stats,
        });
    }
}

module.exports = new AnalyticsService();
