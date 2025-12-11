"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");

class UserLearningPathService {
  /**
   * Gán lộ trình học (learningPath) cho user, kèm target
   * @param {String} userId - ID người dùng
   * @param {String} learningPathId - ID lộ trình
   * @param {String} targetId - ID mục tiêu học tập (optional)
   */
  async assignPathToUser(userId, learningPathId, targetId) {
    const existing = await UserLearningPathRepository.findByUserAndPath(
      userId,
      learningPathId
    );

    if (existing) {
      return ResponseBuilder.duplicateError();
    }

    const newRecord = await UserLearningPathRepository.create({
      user: userId,
      learningPath: learningPathId,
      target: targetId || null,
      status: "active",
      progress: {
        currentLevel: 1,
        currentLesson: 1,
        completedLessons: [],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
      lastAccAt: Date.now(),
    });

    return newRecord;
  }

  async getUserLearningPaths(req) {
    const userId = req.user._id;
    const paths = await UserLearningPathRepository.findByUserId(userId);
    return ResponseBuilder.success("Fetched user learning paths", paths);
  }

  /**
   * Get comprehensive user overview/dashboard data
   * Aggregates learning path, progress, recent lessons, and statistics
   */
  async getUserOverview(req) {
    const userId = req.user._id;
    const { toObjectId } = require("../helpers/idHelper");
    const LearningPathRepository = require("../repositories/learningPath.repo");
    const UserProgressRepository = require("../repositories/userProgress.repo");
    const LessonRepository = require("../repositories/lesson.repo");

    try {
      // Get user's active learning path
      const userPaths = await UserLearningPathRepository.findByUserId(userId);

      if (!userPaths || userPaths.length === 0) {
        return ResponseBuilder.success("No active learning path found", {
          hasLearningPath: false,
          message: "Please complete onboarding to start learning",
        });
      }

      // Get the first active path (or most recent)
      const userLearningPath = userPaths[0];
      const learningPathId = userLearningPath.learningPath;

      // Fetch learning path with full details
      const learningPath = await LearningPathRepository.findByIdWithFullDetails(
        learningPathId
      );

      if (!learningPath) {
        return ResponseBuilder.notFoundError("Learning path not found");
      }

      // Get user progress for this learning path
      const userProgress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      // Calculate statistics
      const currentLevel = userLearningPath.progress?.currentLevel || 1;
      const completedLessons = userLearningPath.progress?.completedLessons || [];
      const totalLevels = learningPath.levels?.length || 0;

      // Count total lessons across all levels
      let totalLessons = 0;
      learningPath.levels?.forEach((level) => {
        totalLessons += level.lessons?.length || 0;
      });

      // Calculate learning path progress percentage
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons.length / totalLessons) * 100)
          : 0;

      // Calculate daily progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lessonsCompletedToday = completedLessons.filter((lessonId) => {
        const lessonProgress = userProgress?.lessonProgress?.find(
          (lp) => lp.lessonId.toString() === lessonId.toString()
        );
        if (lessonProgress?.completedAt) {
          const completedDate = new Date(lessonProgress.completedAt);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        }
        return false;
      }).length;

      const dailyGoal = userLearningPath.dailyGoal || 10;
      const dailyProgressPercentage = Math.min(
        Math.round((lessonsCompletedToday / dailyGoal) * 100),
        100
      );

      // Calculate streak (simplified - consecutive days)
      let streak = 0;
      if (userProgress?.lessonProgress?.length > 0) {
        const sortedProgress = [...userProgress.lessonProgress]
          .filter((lp) => lp.completedAt)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (sortedProgress.length > 0) {
          const lastCompleted = new Date(sortedProgress[0].completedAt);
          lastCompleted.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor(
            (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
          );

          // If completed today or yesterday, count streak
          if (daysDiff <= 1) {
            streak = 1;
            // Count consecutive days (simplified version)
            for (let i = 1; i < sortedProgress.length; i++) {
              const currentDate = new Date(sortedProgress[i - 1].completedAt);
              const prevDate = new Date(sortedProgress[i].completedAt);
              currentDate.setHours(0, 0, 0, 0);
              prevDate.setHours(0, 0, 0, 0);

              const diff = Math.floor(
                (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diff === 1) {
                streak++;
              } else {
                break;
              }
            }
          }
        }
      }

      // Get recently accessed lessons
      const recentLessons = [];
      if (userProgress?.lessonProgress?.length > 0) {
        const sortedByAccess = [...userProgress.lessonProgress]
          .sort(
            (a, b) =>
              new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
          )
          .slice(0, 5);

        for (const lessonProg of sortedByAccess) {
          const lesson = await LessonRepository.getLessonById(
            lessonProg.lessonId
          );
          if (lesson) {
            const totalBlocks = lesson.blocks?.length || 0;
            const completedBlocks =
              lessonProg.blockProgress?.filter((bp) => bp.isCompleted)
                .length || 0;
            const lessonProgressPercentage =
              totalBlocks > 0
                ? Math.round((completedBlocks / totalBlocks) * 100)
                : 0;

            recentLessons.push({
              id: lesson._id,
              title: lesson.title,
              topic: lesson.topic,
              skill: lesson.skill,
              isCompleted: lessonProg.isCompleted,
              progressPercentage: lessonProgressPercentage,
              lastAccessedAt: lessonProg.lastAccessedAt,
            });
          }
        }
      }

      // Calculate vocabulary statistics
      const VocabularyBlock = require("../models/subModel/VocabularyBlock.schema");
      const CardDeck = require("../models/CardDeck");
      const Flashcard = require("../models/FlashCard");

      // 1. Get all completed block IDs
      const completedBlockIds = [];
      userProgress?.lessonProgress?.forEach((lp) => {
        lp.blockProgress?.forEach((bp) => {
          if (bp.isCompleted) {
            completedBlockIds.push(bp.blockId);
          }
        });
      });

      // 2. Find completed VocabularyBlocks
      const completedVocabBlocks = await VocabularyBlock.find({
        _id: { $in: completedBlockIds },
      });

      // 3. Get CardDeck IDs
      const cardDeckIds = completedVocabBlocks.map((b) => b.cardDeck);

      // 4. Get CardDecks to know the level
      const cardDecks = await CardDeck.find({ _id: { $in: cardDeckIds } });
      const deckLevelMap = {}; // deckId -> level
      cardDecks.forEach((deck) => {
        deckLevelMap[deck._id.toString()] = deck.level;
      });

      // 5. Count flashcards per deck
      // We can aggregate to count flashcards by cardDeck
      const flashcardCounts = await Flashcard.aggregate([
        { $match: { cardDeck: { $in: cardDeckIds } } },
        { $group: { _id: "$cardDeck", count: { $sum: 1 } } },
      ]);

      // 6. Map counts to levels
      const statsByLevel = {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      };
      let totalWordsLearned = 0;

      flashcardCounts.forEach((item) => {
        const deckId = item._id.toString();
        const count = item.count;
        const level = deckLevelMap[deckId] || "beginner"; // Default to beginner if not found

        if (statsByLevel[level] !== undefined) {
          statsByLevel[level] += count;
          totalWordsLearned += count;
        }
      });

      const vocabularyStats = {
        totalWords: totalWordsLearned,
        byLevel: [
          { level: "Beginner", count: statsByLevel.beginner },
          { level: "Intermediate", count: statsByLevel.intermediate },
          { level: "Advanced", count: statsByLevel.advanced },
        ],
      };

      // Build overview response
      const overview = {
        hasLearningPath: true,
        user: {
          name: req.user.name || req.user.email,
          currentLevel,
          streak,
        },
        dailyProgress: {
          goal: dailyGoal,
          completed: lessonsCompletedToday,
          percentage: dailyProgressPercentage,
        },
        learningPath: {
          id: learningPath._id,
          title: learningPath.title,
          description: learningPath.description,
          totalLevels,
          currentLevel,
          totalLessons,
          completedLessons: completedLessons.length,
          progressPercentage,
        },
        recentLessons,
        vocabularyStats,
        quickActions: [
          {
            id: "continue-learning",
            label: "Continue Learning",
            icon: "📚",
            link: `/topic-list?pathId=${learningPath._id}`,
          },
          {
            id: "practice-vocabulary",
            label: "Practice Vocabulary",
            icon: "✍️",
            link: "/practice",
          },
          {
            id: "take-quiz",
            label: "Take Quiz",
            icon: "🎯",
            link: "/quizzes",
          },
        ],
      };

      return ResponseBuilder.success(
        "Fetched user overview successfully",
        overview
      );
    } catch (error) {
      console.error("[UserLearningPathService] Error getting overview:", error);
      return ResponseBuilder.error(
        "Failed to fetch user overview",
        500,
        error.message
      );
    }
  }
}

module.exports = new UserLearningPathService();
