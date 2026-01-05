"use strict";

const { toObjectId } = require("../helpers/idHelper");
const QuizAttempt = require("../models/QuizAttempt");
const QuizAttemptForBlock = require("../models/QuizAttemptForBlock");
const UserProgress = require("../models/UserProgress");

/**
 * Service for performance analytics and trend tracking
 * Provides data for charts and visualizations
 */
class PerformanceAnalyticsService {
  /**
   * Get comprehensive performance data for charts
   * @param {String} userId - User ID
   * @param {String} period - Time period ('week', 'month')
   * @returns {Object} Performance data for charts
   */
  async getPerformanceData(userId, period = "week") {
    try {
      const days = period === "week" ? 7 : 30;

      const [accuracyTrend, studyTimeDistribution] = await Promise.all([
        this.getAccuracyTrend(userId, days),
        this.getStudyTimeDistribution(userId, days),
      ]);

      return {
        accuracyTrend,
        studyTimeDistribution,
        skillImprovements: [], // Can be enhanced later with historical comparison
      };
    } catch (error) {
      console.error("Error getting performance data:", error);
      return {
        accuracyTrend: { labels: [], data: [] },
        studyTimeDistribution: { labels: [], data: [] },
        skillImprovements: [],
      };
    }
  }

  /**
   * Get accuracy trend over time
   * @param {String} userId - User ID
   * @param {Number} days - Number of days to look back
   * @returns {Object} Accuracy trend data
   */
  async getAccuracyTrend(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get quiz attempts from the last N days
      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
        completedAt: { $gte: startDate },
      })
        .select("percentage completedAt")
        .sort({ completedAt: 1 })
        .lean();

      // Get quiz attempts for blocks
      const blockQuizAttempts = await QuizAttemptForBlock.find({
        user: toObjectId(userId),
        status: "completed",
        completedAt: { $gte: startDate },
      })
        .select("percentage completedAt")
        .sort({ completedAt: 1 })
        .lean();

      // Combine all attempts
      const allAttempts = [...quizAttempts, ...blockQuizAttempts];

      // Group by date and calculate average accuracy per day
      const dailyAccuracy = {};
      const dayNames = this.getDayNames(days);

      // Initialize all days with 0
      dayNames.forEach((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - index));
        const dateKey = date.toISOString().split("T")[0];
        dailyAccuracy[dateKey] = { total: 0, count: 0, label: day };
      });

      // Aggregate attempts by date
      allAttempts.forEach((attempt) => {
        const dateKey = new Date(attempt.completedAt)
          .toISOString()
          .split("T")[0];
        if (dailyAccuracy[dateKey]) {
          dailyAccuracy[dateKey].total += attempt.percentage || 0;
          dailyAccuracy[dateKey].count += 1;
        }
      });

      // Calculate averages
      const labels = [];
      const data = [];

      Object.keys(dailyAccuracy)
        .sort()
        .forEach((dateKey) => {
          const day = dailyAccuracy[dateKey];
          labels.push(day.label);
          const avg = day.count > 0 ? day.total / day.count : 0;
          data.push(Math.round(avg * 10) / 10);
        });

      return { labels, data };
    } catch (error) {
      console.error("Error getting accuracy trend:", error);
      return { labels: [], data: [] };
    }
  }

  /**
   * Get study time distribution over the week
   * @param {String} userId - User ID
   * @param {Number} days - Number of days to look back
   * @returns {Object} Study time distribution data
   */
  async getStudyTimeDistribution(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user progress updates from the last N days
      const userProgress = await UserProgress.find({
        user: toObjectId(userId),
        updatedAt: { $gte: startDate },
      })
        .select("timeSpent updatedAt lessonProgress")
        .lean();

      // Get quiz attempts for time spent
      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
        completedAt: { $gte: startDate },
      })
        .select("timeSpent completedAt")
        .lean();

      // Get block quiz attempts for time spent
      const blockQuizAttempts = await QuizAttemptForBlock.find({
        user: toObjectId(userId),
        status: "completed",
        completedAt: { $gte: startDate },
      })
        .select("timeSpent completedAt")
        .lean();

      // Group by date
      const dailyTime = {};
      const dayNames = this.getDayNames(days);

      // Initialize all days with 0
      dayNames.forEach((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - index));
        const dateKey = date.toISOString().split("T")[0];
        dailyTime[dateKey] = { total: 0, label: day };
      });

      // Aggregate time from user progress (lesson time)
      userProgress.forEach((progress) => {
        const dateKey = new Date(progress.updatedAt)
          .toISOString()
          .split("T")[0];
        if (dailyTime[dateKey] && progress.timeSpent) {
          dailyTime[dateKey].total += progress.timeSpent;
        }
      });

      // Aggregate time from quiz attempts
      [...quizAttempts, ...blockQuizAttempts].forEach((attempt) => {
        const dateKey = new Date(attempt.completedAt)
          .toISOString()
          .split("T")[0];
        if (dailyTime[dateKey] && attempt.timeSpent) {
          dailyTime[dateKey].total += attempt.timeSpent;
        }
      });

      // Convert to labels and data (in minutes)
      const labels = [];
      const data = [];

      Object.keys(dailyTime)
        .sort()
        .forEach((dateKey) => {
          const day = dailyTime[dateKey];
          labels.push(day.label);
          // Convert seconds to minutes
          const minutes = Math.round(day.total / 60);
          data.push(minutes);
        });

      return { labels, data };
    } catch (error) {
      console.error("Error getting study time distribution:", error);
      return { labels: [], data: [] };
    }
  }

  /**
   * Get skill improvement trend over time
   * @param {String} userId - User ID
   * @param {String} skill - Skill name
   * @param {Number} days - Number of days to look back
   * @returns {Object} Skill improvement data
   */
  async getSkillImprovementTrend(userId, skill, days = 30) {
    // This can be implemented later by comparing current skill scores
    // with historical scores (requires storing historical snapshots)
    return {
      skill,
      change: 0,
      trend: "stable",
    };
  }

  /**
   * Helper: Get day names for the last N days
   * @param {Number} days - Number of days
   * @returns {Array} Day names
   */
  getDayNames(days) {
    const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const names = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNamesShort[date.getDay()];
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      names.push(days <= 7 ? dayName : dateStr);
    }

    return names;
  }
}

module.exports = new PerformanceAnalyticsService();
