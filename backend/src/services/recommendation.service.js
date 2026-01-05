"use strict";

const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const Lesson = require("../models/Lessson");
const LearningPath = require("../models/LearningPath");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");

class RecommendationService {
  async getRecommendedLessons(userId, learningPathId, weakSkills, limit = 5) {
    try {
      if (!weakSkills || weakSkills.length === 0) {
        return [];
      }

      const sortedSkills = [...weakSkills].sort((a, b) => a.score - b.score);

      const userProgress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      const completedLessonIds = [];
      if (userProgress && userProgress.length > 0) {
        userProgress.forEach((up) => {
          if (up.lessonProgress) {
            up.lessonProgress.forEach((lp) => {
              if (lp.isCompleted) {
                completedLessonIds.push(lp.lessonId.toString());
              }
            });
          }
        });
      }

      const recommendations = [];

      for (const weakSkill of sortedSkills) {
        const lessons = await Lesson.find({
          skill: weakSkill.skill,
          status: STATUS.ACTIVE,
          _id: { $nin: completedLessonIds.map(id => toObjectId(id)) }
        })
          .populate("categoryId", "name")
          .limit(3)
          .lean();

        lessons.forEach((lesson) => {
          if (recommendations.length < limit) {
            recommendations.push({
              ...lesson,
              recommendedFor: weakSkill.skill,
              priority: weakSkill.score < 40 ? "high" : weakSkill.score < 60 ? "medium" : "low",
              reason: `Improve your ${weakSkill.skill} skill (current score: ${weakSkill.score.toFixed(0)})`,
            });
          }
        });

        if (recommendations.length >= limit) {
          break;
        }
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error("Error getting recommended lessons:", error);
      return [];
    }
  }

  async suggestNewLearningPath(userId, currentPathId) {
    try {
      // 1. Get user's current learning path
      const userLearningPath = await UserLearningPathRepository.findByUserAndPath(
        userId,
        currentPathId
      );

      if (!userLearningPath || userLearningPath.length === 0) {
        return {
          shouldEnroll: false,
          reason: "No active learning path found",
        };
      }

      const userPath = userLearningPath[0];

      // Check if userPath has progress field
      if (!userPath || !userPath.progress) {
        return {
          shouldEnroll: false,
          reason: "Learning path progress not available",
        };
      }

      // 2. Get learning path details
      const learningPath = await LearningPath.findById(currentPathId).lean();

      if (!learningPath) {
        return {
          shouldEnroll: false,
          reason: "Learning path not found",
        };
      }

      // 3. Calculate completion percentage
      const completedLessons = userPath.progress?.completedLessons || [];

      // Count total lessons in learning path
      let totalLessons = 0;
      learningPath.levels?.forEach((level) => {
        totalLessons += level.lessons?.length || 0;
      });

      const completionPercentage = totalLessons > 0
        ? (completedLessons.length / totalLessons) * 100
        : 0;

      // 4. If >= 75% completed, suggest next level path
      if (completionPercentage >= 75) {
        // Find next level path
        const suggestedPath = await this.findNextLevelPath(learningPath);

        if (suggestedPath) {
          return {
            shouldEnroll: true,
            suggestedPath: {
              _id: suggestedPath._id,
              title: suggestedPath.title,
              description: suggestedPath.description,
              level: suggestedPath.level,
            },
            reason: `You are ${completionPercentage.toFixed(0)}% done with your current path. Ready for the next level!`,
          };
        }
      }

      return {
        shouldEnroll: false,
        reason: `Keep going! You're ${completionPercentage.toFixed(0)}% done with your current path.`,
      };
    } catch (error) {
      console.error("Error suggesting new learning path:", error);
      return {
        shouldEnroll: false,
        reason: "Error checking path progress",
      };
    }
  }

  async findNextLevelPath(currentPath) {
    try {
      const levelOrder = {
        "beginner": 1,
        "elementary": 2,
        "pre_intermediate": 3,
        "intermediate": 4,
        "upper_intermediate": 5,
        "advanced": 6,
      };

      const currentLevelValue = levelOrder[currentPath.level] || 1;

      // Find paths with next level
      const nextLevelKey = Object.keys(levelOrder).find(
        (key) => levelOrder[key] === currentLevelValue + 1
      );

      if (!nextLevelKey) {
        return null; // Already at max level
      }

      // Find a path with the next level
      const nextPath = await LearningPath.findOne({
        level: nextLevelKey,
        status: STATUS.ACTIVE,
      })
        .select("_id title description level")
        .lean();

      return nextPath;
    } catch (error) {
      console.error("Error finding next level path:", error);
      return null;
    }
  }

  async generateStudySchedule(userId, dailyGoal = 10, availability = null) {
    try {
      // Default suggestions based on daily goal
      const suggestedDuration = Math.max(15, dailyGoal * 3); // ~3 min per lesson

      // Suggest optimal time (default to evening if not specified)
      const suggestedTime = availability || "20:00";

      // Suggest activities based on goal
      const suggestedActivities = [];

      if (dailyGoal <= 5) {
        suggestedActivities.push("Complete 1-2 lessons");
        suggestedActivities.push("Practice vocabulary (5 min)");
      } else if (dailyGoal <= 10) {
        suggestedActivities.push("Complete 2-3 lessons");
        suggestedActivities.push("Practice vocabulary (10 min)");
        suggestedActivities.push("Review previous lessons (5 min)");
      } else {
        suggestedActivities.push("Complete 3-5 lessons");
        suggestedActivities.push("Practice vocabulary (15 min)");
        suggestedActivities.push("Take a quiz (10 min)");
        suggestedActivities.push("Review weak areas (10 min)");
      }

      const reasoning = dailyGoal <= 5
        ? "Light study session to build consistency"
        : dailyGoal <= 10
          ? "Balanced study session for steady progress"
          : "Intensive study session for fast improvement";

      return {
        suggestedTime,
        suggestedDuration,
        suggestedActivities,
        reasoning,
      };
    } catch (error) {
      console.error("Error generating study schedule:", error);
      return {
        suggestedTime: "20:00",
        suggestedDuration: 30,
        suggestedActivities: ["Complete lessons", "Practice vocabulary"],
        reasoning: "Default study schedule",
      };
    }
  }
}

module.exports = new RecommendationService();
