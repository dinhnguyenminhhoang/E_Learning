"use strict";

const { toObjectId } = require("../helpers/idHelper");
const QuizAttempt = require("../models/QuizAttempt");
const ExamAttempt = require("../models/ExamAttempt");
const UserProgress = require("../models/UserProgress");
const Lesson = require("../models/Lessson");
const User = require("../models/User");
const SpeakingPracticeAttempt = require("../models/SpeakingPracticeAttempt");
const ListeningPracticeAttempt = require("../models/ListeningPracticeAttempt");
const WritingPracticeAttempt = require("../models/WritingPracticeAttempt");

/**
 * Service for analyzing user's skill performance across 6 key skills:
 * listening, speaking, reading, writing, grammar, vocabulary
 */
class SkillAnalysisService {
  /**
   * Analyze all 6 skills for a user
   * @param {String} userId - User ID
   * @param {String} learningPathId - Learning Path ID
   * @param {Number} totalWordsLearned - Total words from vocabularyStats
   * @returns {Object} Skill analysis results
   */
  async analyzeUserSkills(userId, learningPathId, totalWordsLearned = 0) {
    try {
      console.log(`[SkillAnalysis] Starting analysis for user ${userId}, totalWords: ${totalWordsLearned}`);

      // TEMPORARY FIX: Since DB might not have lessons, use simplified analysis
      // Run all skill analyses in parallel for better performance
      const [
        listeningSkill,
        speakingSkill,
        readingSkill,
        writingSkill,
        grammarSkill,
        vocabularySkill,
      ] = await Promise.all([
        this.analyzeListeningSkill(userId, learningPathId),
        this.analyzeSpeakingSkill(userId, learningPathId),
        this.analyzeReadingSkill(userId, learningPathId),
        this.analyzeWritingSkill(userId, learningPathId),
        this.analyzeGrammarSkill(userId, learningPathId),
        this.analyzeVocabularySkill(userId, learningPathId, totalWordsLearned), // Pass actual word count
      ]);

      console.log(`[SkillAnalysis] Analysis complete:`, {
        listening: listeningSkill.score,
        speaking: speakingSkill.score,
        reading: readingSkill.score,
        writing: writingSkill.score,
        grammar: grammarSkill.score,
        vocabulary: vocabularySkill.score
      });

      const skills = [
        listeningSkill,
        speakingSkill,
        readingSkill,
        writingSkill,
        grammarSkill,
        vocabularySkill,
      ];

      // Calculate overall strength (average of all skills)
      const overallStrength =
        skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length;

      // Find weakest and strongest skills
      const sortedByScore = [...skills].sort((a, b) => a.score - b.score);
      const weakestSkill = sortedByScore[0].skill;
      const strongestSkill = sortedByScore[sortedByScore.length - 1].skill;

      return {
        skills,
        overallStrength: Math.round(overallStrength * 10) / 10, // Round to 1 decimal
        weakestSkill,
        strongestSkill,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error analyzing user skills:", error);
      throw error;
    }
  }

  /**
   * Analyze listening skill
   */
  async analyzeListeningSkill(userId, learningPathId) {
    try {
      console.log(`[SkillAnalysis] Analyzing listening for user ${userId}`);

      const listeningPracticeAttempts = await ListeningPracticeAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      }).lean();

      console.log(`[SkillAnalysis] Found ${listeningPracticeAttempts.length} listening practice attempts`);

      let totalPracticeAccuracy = 0;
      listeningPracticeAttempts.forEach((attempt) => {
        totalPracticeAccuracy += attempt.accuracy || 0;
      });

      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: "listening" },
          select: "skill title",
        })
        .lean();

      const listeningQuizAttempts = quizAttempts.filter(
        (attempt) => attempt.quiz
      );

      console.log(`[SkillAnalysis] Found ${listeningQuizAttempts.length} listening quiz attempts`);

      const examAttempts = await this.getExamAttemptsBySkill(
        userId,
        "listening"
      );

      console.log(`[SkillAnalysis] Found ${examAttempts.length} listening exam attempts`);

      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "listening"
      );

      console.log(`[SkillAnalysis] Listening lesson completion: ${lessonProgress.completionRate}%`);

      let totalAccuracy = 0;
      let totalAttempts = 0;

      if (listeningPracticeAttempts.length > 0) {
        totalAccuracy += totalPracticeAccuracy;
        totalAttempts += listeningPracticeAttempts.length;
      }

      listeningQuizAttempts.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      console.log(`[SkillAnalysis] Listening skill - Accuracy: ${avgAccuracy.toFixed(2)}, Completion: ${completionRate.toFixed(2)}%, Attempts: ${totalAttempts}`);

      const result = this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        totalAttempts,
        "listening"
      );

      console.log(`[SkillAnalysis] Listening final score: ${result.score}`);
      return result;
    } catch (error) {
      console.error("Error analyzing listening skill:", error);
      return this.getEmptySkillScore("listening");
    }
  }

  /**
   * Analyze speaking skill
   */
  async analyzeSpeakingSkill(userId, learningPathId) {
    try {
      console.log(`[SkillAnalysis] Analyzing speaking for user ${userId}`);

      const speakingPracticeAttempts = await SpeakingPracticeAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      }).lean();

      console.log(`[SkillAnalysis] Found ${speakingPracticeAttempts.length} speaking practice attempts`);

      let totalPracticeAccuracy = 0;
      speakingPracticeAttempts.forEach((attempt) => {
        totalPracticeAccuracy += attempt.accuracy || 0;
      });

      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
        "answers.speakingAnswer": { $exists: true },
      }).lean();

      console.log(`[SkillAnalysis] Found ${quizAttempts.length} quiz attempts with speakingAnswer`);

      let speakingAnswersCount = 0;
      let totalCorrect = 0;

      quizAttempts.forEach((attempt) => {
        attempt.answers.forEach((answer) => {
          if (answer.speakingAnswer) {
            speakingAnswersCount++;
            if (answer.isCorrect) totalCorrect++;
          }
        });
      });

      console.log(`[SkillAnalysis] Speaking answers count: ${speakingAnswersCount}, correct: ${totalCorrect}`);

      // 2. Get quiz attempts for speaking quizzes (check both "speaking" and "speaking-practice")
      const speakingQuizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: { $in: ["speaking", "speaking-practice"] } },
          select: "skill title",
        })
        .lean();

      const validSpeakingQuizzes = speakingQuizAttempts.filter(
        (attempt) => attempt.quiz
      );

      console.log(`[SkillAnalysis] Found ${validSpeakingQuizzes.length} speaking quiz attempts`);

      // 3. Get exam attempts for speaking sections
      const examAttempts = await this.getExamAttemptsBySkill(
        userId,
        "speaking"
      );

      console.log(`[SkillAnalysis] Found ${examAttempts.length} speaking exam attempts`);

      // 4. Get lesson progress for speaking lessons (check both skill names)
      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "speaking"
      );

      console.log(`[SkillAnalysis] Speaking lesson completion: ${lessonProgress.completionRate}%`);

      // 5. Calculate metrics
      let totalAccuracy = 0;
      let totalAttempts = speakingAnswersCount;

      // Add speaking practice attempts
      if (speakingPracticeAttempts.length > 0) {
        totalAccuracy += totalPracticeAccuracy;
        totalAttempts += speakingPracticeAttempts.length;
      }

      // Accuracy from speaking answers
      const speakingAnswerAccuracy =
        speakingAnswersCount > 0
          ? (totalCorrect / speakingAnswersCount) * 100
          : 0;
      if (speakingAnswersCount > 0) {
        totalAccuracy += speakingAnswerAccuracy;
      }

      // From speaking quiz attempts
      validSpeakingQuizzes.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      // From exam attempts
      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      console.log(`[SkillAnalysis] Speaking skill - Accuracy: ${avgAccuracy.toFixed(2)}, Completion: ${completionRate.toFixed(2)}%, Attempts: ${totalAttempts}`);

      const result = this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        totalAttempts,
        "speaking"
      );

      console.log(`[SkillAnalysis] Speaking final score: ${result.score}`);
      return result;
    } catch (error) {
      console.error("Error analyzing speaking skill:", error);
      return this.getEmptySkillScore("speaking");
    }
  }

  /**
   * Analyze reading skill
   */
  async analyzeReadingSkill(userId, learningPathId) {
    try {
      // 1. Get quiz attempts for reading quizzes
      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: "reading" },
          select: "skill title",
        })
        .lean();

      const readingQuizAttempts = quizAttempts.filter(
        (attempt) => attempt.quiz
      );

      // 2. Get exam attempts for reading sections
      const examAttempts = await this.getExamAttemptsBySkill(userId, "reading");

      // 3. Get lesson progress for reading lessons
      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "reading"
      );

      // 4. Calculate metrics
      let totalAccuracy = 0;
      let totalAttempts = 0;

      readingQuizAttempts.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      return this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        totalAttempts,
        "reading"
      );
    } catch (error) {
      console.error("Error analyzing reading skill:", error);
      return this.getEmptySkillScore("reading");
    }
  }

  /**
   * Analyze writing skill
   */
  async analyzeWritingSkill(userId, learningPathId) {
    try {
      console.log(`[SkillAnalysis] Analyzing writing for user ${userId}`);

      const writingPracticeAttempts = await WritingPracticeAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      }).lean();

      console.log(`[SkillAnalysis] Found ${writingPracticeAttempts.length} writing practice attempts`);

      let totalPracticeScore = 0;
      let totalPracticeGrammarErrors = 0;
      writingPracticeAttempts.forEach((attempt) => {
        totalPracticeScore += attempt.score || 0;
        totalPracticeGrammarErrors += attempt.grammarErrorCount || 0;
      });

      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
        "answers.writingGrading": { $exists: true },
      }).lean();

      console.log(`[SkillAnalysis] Found ${quizAttempts.length} quiz attempts with writingGrading`);

      let totalWritingScore = 0;
      let writingAnswersCount = 0;
      let totalGrammarErrors = 0;

      quizAttempts.forEach((attempt) => {
        attempt.answers.forEach((answer) => {
          if (answer.writingGrading && answer.writingGrading.grading) {
            totalWritingScore += answer.writingGrading.grading.score || 0;
            writingAnswersCount++;

            if (answer.writingGrading.grammar_errors) {
              totalGrammarErrors +=
                answer.writingGrading.grammar_errors.length;
            }
          }
        });
      });

      totalGrammarErrors += totalPracticeGrammarErrors;

      console.log(`[SkillAnalysis] Writing answers count: ${writingAnswersCount}, total score: ${totalWritingScore}, grammar errors: ${totalGrammarErrors}`);

      // 2. Get quiz attempts for writing quizzes
      const writingQuizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: "writing" },
          select: "skill title",
        })
        .lean();

      const validWritingQuizzes = writingQuizAttempts.filter(
        (attempt) => attempt.quiz
      );

      // 3. Get exam attempts for writing sections
      const examAttempts = await this.getExamAttemptsBySkill(userId, "writing");

      // 4. Get lesson progress for writing lessons
      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "writing"
      );

      // 5. Calculate metrics
      let totalAccuracy = 0;
      let totalAttempts = writingAnswersCount;

      // Add writing practice attempts
      if (writingPracticeAttempts.length > 0) {
        totalAccuracy += totalPracticeScore;
        totalAttempts += writingPracticeAttempts.length;
      }

      // Accuracy from writing grading scores
      if (writingAnswersCount > 0) {
        totalAccuracy += totalWritingScore / writingAnswersCount;
      }

      // From writing quiz attempts
      validWritingQuizzes.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      // From exam attempts
      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      console.log(`[SkillAnalysis] Writing skill - Accuracy: ${avgAccuracy.toFixed(2)}, Completion: ${completionRate.toFixed(2)}%, Attempts: ${totalAttempts}`);

      const result = this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        totalAttempts,
        "writing",
        { grammarErrorRate: writingAnswersCount > 0 ? totalGrammarErrors / writingAnswersCount : 0 }
      );

      console.log(`[SkillAnalysis] Writing final score: ${result.score}`);
      return result;
    } catch (error) {
      console.error("Error analyzing writing skill:", error);
      return this.getEmptySkillScore("writing");
    }
  }

  /**
   * Analyze grammar skill
   */
  async analyzeGrammarSkill(userId, learningPathId) {
    try {
      console.log(`[SkillAnalysis] Analyzing grammar for user ${userId}`);

      const writingPracticeAttempts = await WritingPracticeAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      }).lean();

      console.log(`[SkillAnalysis] Found ${writingPracticeAttempts.length} writing practice attempts for grammar`);

      let practiceGrammarErrors = 0;
      let practiceCount = 0;
      writingPracticeAttempts.forEach((attempt) => {
        practiceGrammarErrors += attempt.grammarErrorCount || 0;
        practiceCount++;
      });

      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
        "answers.writingGrading": { $exists: true },
      }).lean();

      let totalGrammarErrors = practiceGrammarErrors;
      let writingAnswersCount = practiceCount;

      quizAttempts.forEach((attempt) => {
        attempt.answers.forEach((answer) => {
          if (answer.writingGrading && answer.writingGrading.grammar_errors) {
            totalGrammarErrors += answer.writingGrading.grammar_errors.length;
            writingAnswersCount++;
          }
        });
      });

      console.log(`[SkillAnalysis] Total grammar errors: ${totalGrammarErrors}, from ${writingAnswersCount} writings`);

      const grammarErrorRate =
        writingAnswersCount > 0 ? totalGrammarErrors / writingAnswersCount : 0;
      const grammarAccuracy = Math.max(0, 100 - grammarErrorRate * 10);

      // 2. Get quiz attempts for grammar quizzes
      const grammarQuizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: "grammar" },
          select: "skill title",
        })
        .lean();

      const validGrammarQuizzes = grammarQuizAttempts.filter(
        (attempt) => attempt.quiz
      );

      // 3. Get exam attempts for grammar sections
      const examAttempts = await this.getExamAttemptsBySkill(userId, "grammar");

      // 4. Get lesson progress for grammar lessons
      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "grammar"
      );

      // 5. Calculate metrics
      let totalAccuracy = grammarAccuracy;
      let totalAttempts = writingAnswersCount;

      // From grammar quiz attempts
      validGrammarQuizzes.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      // From exam attempts
      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      return this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        totalAttempts,
        "grammar"
      );
    } catch (error) {
      console.error("Error analyzing grammar skill:", error);
      return this.getEmptySkillScore("grammar");
    }
  }

  /**
   * Analyze vocabulary skill
   * @param {String} userId - User ID
   * @param {String} learningPathId - Learning Path ID
   * @param {Number} totalWordsLearned - Actual word count from vocabularyStats
   */
  async analyzeVocabularySkill(userId, learningPathId, totalWordsLearned = 0) {
    try {
      console.log(`[SkillAnalysis] Analyzing vocabulary: ${totalWordsLearned} words`);

      // 2. Get quiz attempts for vocabulary quizzes
      const quizAttempts = await QuizAttempt.find({
        user: toObjectId(userId),
        status: "completed",
      })
        .populate({
          path: "quiz",
          match: { skill: "vocabulary" },
          select: "skill title",
        })
        .lean();

      const vocabQuizAttempts = quizAttempts.filter(
        (attempt) => attempt.quiz
      );

      // 3. Get exam attempts for vocabulary sections
      const examAttempts = await this.getExamAttemptsBySkill(
        userId,
        "vocabulary"
      );

      // 4. Get lesson progress for vocabulary lessons
      const lessonProgress = await this.getLessonProgressBySkill(
        userId,
        learningPathId,
        "vocabulary"
      );

      // 5. Calculate metrics
      let totalAccuracy = 0;
      let totalAttempts = 0;

      vocabQuizAttempts.forEach((attempt) => {
        totalAccuracy += attempt.percentage || 0;
        totalAttempts++;
      });

      examAttempts.forEach((examAttempt) => {
        totalAccuracy += examAttempt.percentage || 0;
        totalAttempts++;
      });

      const avgAccuracy =
        totalAttempts > 0 ? totalAccuracy / totalAttempts : 0;
      const completionRate = lessonProgress.completionRate || 0;

      // IMPROVED: Use words learned as direct score contribution
      // Formula: 1 word = 2 points, max 50 points from words alone (without quizzes)
      // 8 words = 16 points, 20 words = 40 points, 25+ words = 50 points
      const wordsBonus = Math.min(totalWordsLearned * 2, 50);

      // If user has learned words but no quiz attempts, give baseline score
      if (totalAttempts === 0 && totalWordsLearned > 0) {
        // Determine category based on words learned
        let category = "weak";
        if (wordsBonus >= 40) category = "moderate";
        if (wordsBonus >= 60) category = "strong"; // With quizzes, can reach 100

        return {
          skill: "vocabulary",
          score: wordsBonus,
          category: category,
          accuracy: 0,
          completionRate: 0,
          totalAttempts: 0,
          totalWordsLearned,
        };
      }

      // Use words learned as bonus for attempts
      const adjustedAttempts = totalAttempts + Math.floor(totalWordsLearned / 10);

      return this.calculateSkillStrength(
        avgAccuracy,
        completionRate,
        adjustedAttempts,
        "vocabulary",
        { totalWordsLearned }
      );
    } catch (error) {
      console.error("Error analyzing vocabulary skill:", error);
      return this.getEmptySkillScore("vocabulary");
    }
  }

  /**
   * Calculate skill strength score using the algorithm
   * @param {Number} accuracyRate - Average accuracy (0-100)
   * @param {Number} completionRate - Lesson completion rate (0-100)
   * @param {Number} attempts - Total attempts/practice count
   * @param {String} skillName - Name of the skill
   * @param {Object} extras - Extra metrics for specific skills
   * @returns {Object} Skill score object
   */
  calculateSkillStrength(
    accuracyRate,
    completionRate,
    attempts,
    skillName,
    extras = {}
  ) {
    // For new users: If no attempts but has completion, give some baseline score
    if (attempts === 0 && completionRate > 0) {
      const baselineScore = (completionRate / 100) * 20;

      return {
        skill: skillName,
        score: Math.round(baselineScore * 10) / 10,
        category: "weak",
        accuracy: 0,
        completionRate: Math.round(completionRate * 10) / 10,
        totalAttempts: 0,
        ...extras,
      };
    }

    // IMPROVED: Penalty for low attempts (need more practice to be confident)
    let attemptsMultiplier = 1.0;
    if (attempts < 3) {
      attemptsMultiplier = 0.5; // Only 50% of accuracy if < 3 attempts
    } else if (attempts < 5) {
      attemptsMultiplier = 0.7; // 70% if < 5 attempts
    } else if (attempts < 10) {
      attemptsMultiplier = 0.85; // 85% if < 10 attempts
    }

    // Base score with attempts penalty
    let baseScore = accuracyRate * attemptsMultiplier;

    // Bonus for completion rate (max +20 points)
    const completionBonus = (completionRate / 100) * 20;

    // Bonus for experience (max +15 points, diminishing returns)
    // Formula: sqrt(attempts) * 3, max 15
    const experienceBonus = Math.min(Math.sqrt(attempts) * 3, 15);

    // Calculate raw strength
    const rawStrength = baseScore + completionBonus + experienceBonus;

    // Normalize to 0-100
    const normalizedStrength = Math.min(rawStrength, 100);

    // Categorize
    let category;
    if (normalizedStrength >= 80) category = "strong";
    else if (normalizedStrength >= 60) category = "moderate";
    else category = "weak";

    return {
      skill: skillName,
      score: Math.round(normalizedStrength * 10) / 10,
      category,
      accuracy: Math.round(accuracyRate * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      totalAttempts: attempts,
      ...extras,
    };
  }

  /**
   * Get exam attempts for a specific skill
   */
  async getExamAttemptsBySkill(userId, skill) {
    try {
      const examAttempts = await ExamAttempt.aggregate([
        {
          $match: {
            user: toObjectId(userId),
            status: "completed",
          },
        },
        {
          $lookup: {
            from: "exams",
            localField: "exam",
            foreignField: "_id",
            as: "examData",
          },
        },
        { $unwind: "$examData" },
        { $unwind: "$examData.sections" },
        {
          $match: {
            "examData.sections.skill": skill,
          },
        },
        { $unwind: "$sections" },
        {
          $match: {
            $expr: {
              $eq: ["$sections.sectionId", "$examData.sections._id"],
            },
          },
        },
        {
          $project: {
            sectionId: "$sections.sectionId",
            score: "$sections.score",
            percentage: "$sections.percentage",
            skill: "$examData.sections.skill",
            completedAt: 1,
          },
        },
      ]);

      return examAttempts;
    } catch (error) {
      console.error("Error getting exam attempts by skill:", error);
      return [];
    }
  }

  /**
   * Get lesson progress for a specific skill
   */
  async getLessonProgressBySkill(userId, learningPathId, skill) {
    try {
      // For grammar and vocabulary, return 0 as they don't have lessons
      // (grammar comes from quiz/writing analysis, vocabulary from flashcards)
      if (skill === "grammar" || skill === "vocabulary") {
        return { completedCount: 0, totalCount: 0, completionRate: 0 };
      }

      // First, check total lessons in DB
      const totalLessons = await Lesson.countDocuments();
      console.log(`[SkillAnalysis] Total lessons in DB: ${totalLessons}`);

      // Get all lessons with this skill (only works for: listening, speaking, reading, writing)
      const lessons = await Lesson.find({
        skill: skill,
        status: { $ne: "deleted" }
      })
        .select("_id title skill status")
        .lean();

      console.log(`[SkillAnalysis] Query for ${skill} returned ${lessons ? lessons.length : 0} lessons`);

      if (lessons && lessons.length > 0) {
        console.log(`[SkillAnalysis] Sample lesson:`, JSON.stringify(lessons[0]));
      }

      if (!lessons || lessons.length === 0) {
        console.log(`[SkillAnalysis] No ${skill} lessons found in DB`);
        return { completedCount: 0, totalCount: 0, completionRate: 0 };
      }

      const lessonIds = lessons.map((l) => l._id.toString());
      console.log(`[SkillAnalysis] Found ${lessonIds.length} ${skill} lessons in DB`);

      // Get user progress - check all UserProgress documents for this user and path
      const userProgressDocs = await UserProgress.find({
        user: toObjectId(userId),
        learningPath: toObjectId(learningPathId),
      })
        .select("lessonProgress lessonLeaned")
        .lean();

      if (!userProgressDocs || userProgressDocs.length === 0) {
        console.log(`[SkillAnalysis] No UserProgress found for user ${userId}`);
        return {
          completedCount: 0,
          totalCount: lessonIds.length,
          completionRate: 0,
        };
      }

      // Count completed lessons for this skill
      // Check both lessonProgress.isCompleted and lessonLeaned array
      let completedCount = 0;
      const completedLessonIds = new Set();

      userProgressDocs.forEach((up) => {
        // Method 1: Check lessonProgress array
        if (up.lessonProgress && Array.isArray(up.lessonProgress)) {
          up.lessonProgress.forEach((lp) => {
            const lessonIdStr = lp.lessonId ? lp.lessonId.toString() : null;
            if (lessonIdStr && lp.isCompleted && lessonIds.includes(lessonIdStr)) {
              completedLessonIds.add(lessonIdStr);
            }
          });
        }

        // Method 2: Check lessonLeaned array (alternative tracking)
        if (up.lessonLeaned && Array.isArray(up.lessonLeaned)) {
          up.lessonLeaned.forEach((lessonId) => {
            const lessonIdStr = lessonId.toString();
            if (lessonIds.includes(lessonIdStr)) {
              completedLessonIds.add(lessonIdStr);
            }
          });
        }
      });

      completedCount = completedLessonIds.size;
      const completionRate = lessonIds.length > 0
        ? (completedCount / lessonIds.length) * 100
        : 0;

      console.log(`[SkillAnalysis] ${skill}: ${completedCount}/${lessonIds.length} lessons completed (${completionRate.toFixed(1)}%)`);

      return {
        completedCount,
        totalCount: lessonIds.length,
        completionRate,
      };
    } catch (error) {
      console.error("Error getting lesson progress by skill:", error);
      return { completedCount: 0, totalCount: 0, completionRate: 0 };
    }
  }

  /**
   * Return empty skill score (for users with no data)
   */
  getEmptySkillScore(skillName) {
    return {
      skill: skillName,
      score: 0,
      category: "weak",
      accuracy: 0,
      completionRate: 0,
      totalAttempts: 0,
    };
  }
}

module.exports = new SkillAnalysisService();
