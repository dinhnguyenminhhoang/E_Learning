const { toObjectId } = require("../helpers/idHelper");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
const BlockRepository = require("../repositories/block.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const LessonRepository = require("../repositories/lesson.repo");
const QuizAttemptForBlockRepository = require("../repositories/quizAttemptForBlock.repo");
const CardDeckRepo = require("../repositories/cardDeck.repo");
const FlashcardRepo = require("../repositories/flashcard.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const AppError = require("../utils/appError");
const { STATUS } = require("../constants/status.constans");
class BlockService {
  async existingBlock(blockId) {
    const block = await BlockRepository.getBlockById(toObjectId(blockId));
    if (!block) {
      throw new AppError("Block not found.", 404);
    }
    return block;
  }

  /**
   * Escape regex special chars to build safe regex for title matching
   * @private
   */
  _escapeRegex(text = "") {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Ensure block title is unique (case-insensitive) within a lesson (if provided)
   * @private
   */
  async _ensureUniqueTitle(title, lessonId, excludeId = null) {
    if (!title) return;
    const regex = new RegExp(`^${this._escapeRegex(title)}$`, "i");
    const query = {
      title: regex,
      status: { $ne: STATUS.DELETED },
    };
    if (lessonId) {
      query.lessonId = lessonId;
    }
    if (excludeId) {
      query._id = { $ne: toObjectId(excludeId) };
    }

    const existing = await BlockRepository.findOne(query);
    if (existing) {
      throw new AppError(
        "Tiêu đề block đã tồn tại trong bài học này. Vui lòng chọn tên khác.",
        400
      );
    }
  }
  /**
   * Format block data theo cấu trúc giống request khi tạo block
   * @private
   * @param {Object} block - Block object từ database
   * @param {String|null} exerciseId - Exercise (Quiz) ID nếu có (từ lesson.blocks)
   * @returns {Object} Formatted block data
   */
  _formatBlockResponse(block, exerciseId = null) {
    // Base fields cho tất cả block types
    const baseData = {
      _id: block._id,
      type: block.type,
      title: block.title || "",
      description: block.description || "",
      skill: block.skill,
      difficulty: block.difficulty,
      lessonId: block.lessonId?._id || block.lessonId || null,
      status: block.status,
      order: block.order,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };

    // Type-specific fields
    switch (block.type) {
      case "grammar":
        return {
          ...baseData,
          topic: block.topic || "",
          explanation: block.explanation || "",
          examples: block.examples || [],
          videoUrl: block.videoUrl || null,
          sourceType: block.sourceType || "upload",
          exercise: exerciseId || null,
          duration: block.duration || 0,
        };

      case "vocabulary":
        return {
          ...baseData,
          cardDeck: block.cardDeck?._id || block.cardDeck || null,
        };

      case "media":
        return {
          ...baseData,
          mediaType: block.mediaType || "video",
          sourceType: block.sourceType || "upload",
          sourceUrl: block.sourceUrl || "",
          transcript: block.transcript || null,
          tasks: block.tasks || [],
        };

      case "quiz":
        return {
          ...baseData,
          questions: block.questions || [],
        };

      default:
        return baseData;
    }
  }

  /**
   * Lấy exercise (Quiz) ID từ lesson cho block cụ thể
   * @private
   * @param {String} blockId - Block ID
   * @param {String} lessonId - Lesson ID
   * @returns {Promise<String|null>} Exercise (Quiz) ID hoặc null
   */
  async _getBlockExercise(blockId, lessonId) {
    if (!lessonId) return null;

    try {
      // Lấy lesson với populate blocks.exercise để lấy exercise ID
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (!lesson || !lesson.blocks) return null;

      // Tìm block trong lesson và lấy exercise ID
      const blockInfo = lesson.blocks.find(
        (b) => b.block?.toString() === blockId.toString()
      );
      console.log(blockInfo);

      if (!blockInfo || !blockInfo.exercise) return null;

      // Trả về exercise ID (string) để giống request structure
      const exerciseId = blockInfo.exercise?._id || blockInfo.exercise;
      return exerciseId ? exerciseId.toString() : null;
    } catch (error) {
      console.error(
        `[BlockService] Error getting exercise for block ${blockId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Lấy block by ID với format response giống request khi tạo
   * @param {Object} req - Express request object
   * @param {String} req.params.blockId - Block ID
   * @returns {Promise<Object>} Response object với formatted block data
   */
  async getBlockById(req) {
    const { blockId } = req.params;
    const block = await this.existingBlock(blockId);

    // Populate lessonId nếu chưa được populate
    let lessonId = block.lessonId;
    if (lessonId && typeof lessonId === "object") {
      lessonId = lessonId._id || lessonId;
    }

    // Lấy exercise từ lesson nếu là grammar block
    let exercise = null;
    if (block.type === "grammar" && lessonId) {
      exercise = await this._getBlockExercise(blockId, lessonId.toString());
    }

    // Format block data
    const formattedBlock = this._formatBlockResponse(block, exercise);

    // Đảm bảo lessonId và cardDeck là string ID (không phải object)
    if (
      formattedBlock.lessonId &&
      typeof formattedBlock.lessonId === "object"
    ) {
      formattedBlock.lessonId =
        formattedBlock.lessonId._id?.toString() ||
        formattedBlock.lessonId.toString();
    }
    if (
      formattedBlock.cardDeck &&
      typeof formattedBlock.cardDeck === "object"
    ) {
      formattedBlock.cardDeck =
        formattedBlock.cardDeck._id?.toString() ||
        formattedBlock.cardDeck.toString();
    }

    return ResponseBuilder.success(
      "Fetched block successfully",
      formattedBlock
    );
  }

  /**
   * Lấy block kèm progress của user (để resume video)
   */
  async getBlockWithProgress(req) {
    const { blockId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;

    // Lấy block
    const block = await this.existingBlock(blockId);

    // Lấy learningPathId (từ query hoặc từ userLearningPath đầu tiên)
    let pathId = learningPathId;
    if (!pathId) {
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.success({
        message: "Fetched block successfully",
        data: {
          block,
          progress: {
            maxWatchedTime: 0,
            videoDuration: 0,
            isCompleted: false,
          },
        },
      });
    }

    // Lấy lessonId từ block
    let lessonId = block.lessonId;
    if (!lessonId) {
      // Nếu block không có lessonId, tìm từ Lesson
      const lessons = await LessonRepository.getLessonsByBlockId(blockId);
      if (lessons && lessons.length > 0) {
        lessonId = lessons[0]._id;
      }
    }

    if (!lessonId) {
      return ResponseBuilder.success({
        message: "Fetched block successfully",
        data: {
          block,
          progress: {
            maxWatchedTime: 0,
            videoDuration: 0,
            isCompleted: false,
          },
        },
      });
    }

    // Lấy block progress
    const blockProgress = await UserProgressRepository.getBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId
    );

    return ResponseBuilder.success({
      message: "Fetched block with progress successfully",
      data: {
        block,
        progress: blockProgress
          ? {
            maxWatchedTime: blockProgress.maxWatchedTime,
            videoDuration: blockProgress.videoDuration,
            isCompleted: blockProgress.isCompleted,
          }
          : {
            maxWatchedTime: 0,
            videoDuration: 0,
            isCompleted: false,
          },
      },
    });
  }

  /**
   * Track video heartbeat - cập nhật progress khi user xem video
   */
  async trackVideoHeartbeat(req) {
    const { blockId } = req.params;
    const userId = req.user._id;
    const { learningPathId, maxWatchedTime, videoDuration } = req.body;

    if (
      typeof maxWatchedTime !== "number" ||
      maxWatchedTime < 0 ||
      typeof videoDuration !== "number" ||
      videoDuration < 0
    ) {
      throw new AppError(
        "maxWatchedTime and videoDuration must be valid numbers",
        400
      );
    }

    // Validate: maxWatchedTime không được vượt quá videoDuration
    if (maxWatchedTime > videoDuration && videoDuration > 0) {
      throw new AppError("maxWatchedTime cannot exceed videoDuration", 400);
    }

    // Lấy block để validate
    const block = await this.existingBlock(blockId);

    // Lấy learningPathId (từ body hoặc từ userLearningPath đầu tiên)
    let pathId = learningPathId;
    if (!pathId) {
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      throw new AppError("Learning path not found for user", 404);
    }

    // Lấy lessonId từ block
    let lessonId = block.lessonId;
    if (!lessonId) {
      // Nếu block không có lessonId, tìm từ Lesson
      const lessons = await LessonRepository.getLessonsByBlockId(blockId);
      if (lessons && lessons.length > 0) {
        lessonId = lessons[0]._id;
      }
    }

    if (!lessonId) {
      throw new AppError("Lesson not found for this block", 404);
    }

    // Lấy progress hiện tại để validate chống tua nhảy vọt
    const existingProgress = await UserProgressRepository.getBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId
    );

    // Validation: Chống tua nhảy vọt bất thường
    let validatedMaxWatchedTime = maxWatchedTime;
    if (existingProgress && existingProgress.maxWatchedTime > 0) {
      const timeSinceLastUpdate =
        (new Date() - new Date(existingProgress.lastUpdatedAt)) / 1000; // seconds
      const reportedIncrease = maxWatchedTime - existingProgress.maxWatchedTime;

      // Cho phép tăng tối đa = thời gian thực tế + tolerance (15 giây)
      // Ví dụ: Nếu 30s trước update lần cuối, chỉ cho phép tăng tối đa 30 + 15 = 45s
      const maxAllowedIncrease = timeSinceLastUpdate + 15;

      if (reportedIncrease > maxAllowedIncrease) {
        // Nếu tăng quá nhanh, clamp lại về giá trị hợp lý
        const clampedMaxWatchedTime =
          existingProgress.maxWatchedTime + maxAllowedIncrease;

        // Log warning (có thể gửi alert cho admin nếu cần)
        console.warn(
          `[Anti-Cheat] User ${userId} tried to skip: ${reportedIncrease}s in ${timeSinceLastUpdate}s. Clamped to ${clampedMaxWatchedTime}s`
        );

        // Sử dụng giá trị đã clamp
        validatedMaxWatchedTime = Math.min(
          clampedMaxWatchedTime,
          videoDuration
        );
      }
    }

    // Kiểm tra trạng thái completed trước khi update
    const wasBlockCompleted = existingProgress?.isCompleted || false;

    // Cập nhật block progress (sử dụng giá trị đã validate)
    const progress = await UserProgressRepository.updateBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId,
      validatedMaxWatchedTime,
      videoDuration
    );

    // Lấy block progress sau khi update
    let updatedBlockProgress = progress.getBlockProgress(
      toObjectId(lessonId),
      toObjectId(blockId)
    );

    // Nếu đã xem hết video (maxWatchedTime = videoDuration), kiểm tra quiz
    const hasWatchedFullVideo =
      validatedMaxWatchedTime > 0 &&
      videoDuration > 0 &&
      validatedMaxWatchedTime >= videoDuration;

    if (hasWatchedFullVideo && updatedBlockProgress) {
      // Cập nhật isCompleted và isLearned dựa trên quiz
      await this._updateBlockCompletionBasedOnQuiz(
        progress,
        lessonId,
        blockId,
        userId
      );

      // Lấy lại block progress sau khi update
      await progress.save();
      updatedBlockProgress = progress.getBlockProgress(
        toObjectId(lessonId),
        toObjectId(blockId)
      );
    }

    const isBlockJustCompleted =
      !wasBlockCompleted && updatedBlockProgress?.isCompleted === true;

    // Chỉ kiểm tra lesson completion khi block vừa được completed
    if (isBlockJustCompleted) {
      await this._checkAndUpdateLessonCompletionIfNeeded(
        userId,
        pathId,
        lessonId
      );
    }

    return ResponseBuilder.success({
      message: "Video progress updated successfully",
      data: {
        isCompleted: updatedBlockProgress?.isCompleted || false,
        isLearned:
          hasWatchedFullVideo || updatedBlockProgress?.isCompleted || false,
        maxWatchedTime: updatedBlockProgress?.maxWatchedTime || 0,
        videoDuration: updatedBlockProgress?.videoDuration || 0,
        progressPercentage:
          updatedBlockProgress?.videoDuration > 0
            ? Math.round(
              (updatedBlockProgress.maxWatchedTime /
                updatedBlockProgress.videoDuration) *
              100
            )
            : 0,
      },
    });
  }

  /**
   * Cập nhật isCompleted và isLearned dựa trên quiz khi đã xem hết video
   * @private
   * @param {Object} progress - UserProgress document
   * @param {String} lessonId - ID của lesson
   * @param {String} blockId - ID của block
   * @param {String} userId - ID của user
   */
  async _updateBlockCompletionBasedOnQuiz(progress, lessonId, blockId, userId) {
    try {
      // Lấy lesson để check block có exercise/quiz không
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (!lesson) {
        return;
      }

      // Tìm block trong lesson để lấy exercise (quiz)
      const blockInLesson = lesson.blocks.find((b) => {
        const blockIdStr = b.block?.toString() || b.block?._id?.toString();
        return blockIdStr === blockId.toString();
      });

      const hasQuiz = !!(blockInLesson && blockInLesson.exercise);

      // Lấy lesson progress
      const lessonProgress = progress.lessonProgress.find(
        (lp) => lp.lessonId.toString() === lessonId.toString()
      );

      if (!lessonProgress) {
        return;
      }

      // Lấy block progress
      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        return;
      }

      // Logic: Khi đã xem hết video (100%)
      // - isLearned = true (đã học - tính toán trong response, không lưu trong DB)
      // - isCompleted phụ thuộc vào quiz

      if (!hasQuiz) {
        // Không có quiz → isCompleted = true (đã học xong video)
        if (!blockProgress.isCompleted) {
          blockProgress.isCompleted = true;
          blockProgress.completedAt = new Date();
        }
      } else {
        // Có quiz → kiểm tra user đã làm quiz và pass chưa
        const passedAttempt =
          await QuizAttemptForBlockRepository.findPassedAttempt(
            toObjectId(userId),
            toObjectId(blockId)
          );

        const hasPassedQuiz = !!(passedAttempt && passedAttempt.isPassed);

        if (hasPassedQuiz) {
          // Đã pass quiz → isCompleted = true
          if (!blockProgress.isCompleted) {
            blockProgress.isCompleted = true;
            blockProgress.completedAt = new Date();
          }
        } else {
          // Chưa pass quiz → isCompleted = false (dù đã xem hết video)
          // Override lại logic >= 85% vì cần pass quiz mới được coi là completed
          blockProgress.isCompleted = false;
          blockProgress.completedAt = null;
        }
      }

      blockProgress.lastUpdatedAt = new Date();
    } catch (error) {
      // Log error nhưng không throw để không làm fail video heartbeat
      console.error(
        `[BlockService] Error updating block completion based on quiz for block ${blockId}:`,
        error
      );
    }
  }

  /**
   * Lấy lesson content dựa trên block type
   * @private
   * @param {Object} block - Block object
   * @returns {Promise<Object>} Lesson content object
   */
  async _getLessonContent(block) {
    try {
      // Case 1: Media hoặc Video - trả về block data trực tiếp
      if (block.type === "media" || block.type === "video") {
        return {
          type: block.type,
          blockData: {
            _id: block._id,
            title: block.title,
            description: block.description,
            videoUrl: block.videoUrl,
            thumbnail: block.thumbnail,
            duration: block.duration,
            order: block.order,
          },
        };
      }

      // Case 2: Vocabulary hoặc có cardDeck
      // Lấy cardDeckId từ nhiều nguồn có thể
      let cardDeckId = null;
      if (block.cardDeck) {
        // Nếu cardDeck đã được populate (là object)
        cardDeckId =
          block.cardDeck._id?.toString() || block.cardDeck.toString();
      } else if (block.cardDeckId) {
        // Nếu có field cardDeckId riêng
        cardDeckId = block.cardDeckId.toString();
      }

      if (block.type === "vocabulary" || cardDeckId) {
        // Validate cardDeckId
        if (!cardDeckId) {
          throw new AppError(
            "CardDeck ID is required for vocabulary block",
            400
          );
        }

        // Lấy CardDeck info
        const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
        if (!cardDeck) {
          throw new AppError("CardDeck not found", 404);
        }

        // Lấy flashcards từ CardDeck với word đã populate
        const flashcards = await FlashcardRepo.findByDeckWithWord(cardDeckId);

        // Format flashcards với word information
        const flashcardsWithWord = flashcards.map((flashcard) => ({
          _id: flashcard._id,
          frontText: flashcard.frontText,
          backText: flashcard.backText,
          difficulty: flashcard.difficulty,
          tags: flashcard.tags || [],
          word: flashcard.word
            ? {
              _id: flashcard.word._id,
              word: flashcard.word.word,
              pronunciation: flashcard.word.pronunciation,
              audio: flashcard.word.audio,
              partOfSpeech: flashcard.word.partOfSpeech,
              definitions: flashcard.word.definitions || [],
              level: flashcard.word.level,
              image: flashcard.word.image,
              synonyms: flashcard.word.synonyms || [],
              antonyms: flashcard.word.antonyms || [],
              tags: flashcard.word.tags || [],
            }
            : null,
        }));

        return {
          type: "vocabulary",
          cardDeck: {
            _id: cardDeck._id,
            title: cardDeck.title,
            description: cardDeck.description,
            level: cardDeck.level,
            thumbnail: cardDeck.thumbnail,
            target: cardDeck.target,
            categoryId: cardDeck.categoryId,
          },
          flashcards: flashcardsWithWord,
        };
      }

      // Case 3: Các type khác (grammar, quiz, etc.)
      const blockData = {
        _id: block._id,
        title: block.title,
        description: block.description,
        order: block.order,
        explanation: block.explanation,
        examples: block.examples,
      };

      // Thêm videoUrl nếu có (cho các block type như grammar có thể có video)
      if (block.videoUrl) {
        blockData.videoUrl = block.videoUrl;
      }

      return {
        type: block.type,
        blockData,
      };
    } catch (error) {
      // Nếu là AppError, throw lại
      if (error instanceof AppError) {
        throw error;
      }
      // Log và throw error khác
      console.error(
        `[BlockService] Error getting lesson content for block ${block._id}:`,
        error
      );
      throw new AppError("Failed to get lesson content", 500);
    }
  }

  /**
   * Bắt đầu học một block - thêm block vào user progress với trạng thái chưa hoàn thành
   * @param {Object} req - Express request object
   * @param {String} req.params.blockId - ID của block
   * @param {String} req.query.learningPathId - ID của learning path (optional)
   * @param {Object} req.user - User object từ authentication middleware
   * @returns {Object} Response object
   */
  async startLearningBlock(req) {
    try {
      const { blockId } = req.params;
      const userId = req.user._id;
      const { learningPathId } = req.query;
      const normalizeId = (id) => {
        if (!id) return null;
        if (typeof id === "object" && id._id) return id._id.toString();
        return id.toString();
      };

      // Validate block tồn tại
      const block = await this.existingBlock(blockId);

      // Lấy learningPathId (từ query hoặc từ userLearningPath đầu tiên)
      let pathId = learningPathId;
      if (!pathId) {
        const userPaths = await UserLearningPathRepository.findByUserId(
          toObjectId(userId)
        );
        if (userPaths && userPaths.length > 0) {
          pathId = userPaths[0].learningPath.toString();
        }
      }

      if (!pathId) {
        return ResponseBuilder.notFoundError(
          "Learning path not found for user"
        );
      }

      // Lấy lessonId từ block
      let lessonId = block.lessonId;
      if (!lessonId) {
        // Nếu block không có lessonId, tìm từ Lesson
        const lessons = await LessonRepository.getLessonsByBlockId(blockId);
        if (lessons && lessons.length > 0) {
          lessonId = lessons[0]._id;
        }
      }

      const lessonIdStr = normalizeId(lessonId);
      if (!lessonId) {
        return ResponseBuilder.notFoundError("Lesson not found for this block");
      }
      if (!lessonIdStr) {
        return ResponseBuilder.notFoundError("Lesson not found for this block");
      }

      // Lấy thông tin quiz gắn với block (exercise từ lesson -> block)
      const exerciseId = await this._getBlockExercise(blockId, lessonIdStr);
      const hasQuiz = !!exerciseId;

      // Kiểm tra xem block progress đã tồn tại chưa
      const existingBlockProgress =
        await UserProgressRepository.getBlockProgress(
          userId,
          pathId,
          lessonIdStr,
          blockId
        );

      // Lấy lesson content dựa trên block type
      let lessonContent = null;
      try {
        lessonContent = await this._getLessonContent(block);
      } catch (error) {
        // Log error nhưng không fail toàn bộ request
        // Frontend có thể handle trường hợp lessonContent = null
        console.error(
          `[BlockService] Error getting lesson content for block ${blockId}:`,
          error
        );
      }

      // Nếu đã có progress, chỉ cập nhật lastAccessedBlockId
      if (existingBlockProgress) {
        await UserProgressRepository.updateLastAccessedBlock(
          userId,
          pathId,
          lessonId,
          blockId
        );

        return ResponseBuilder.success({
          message: "Block đã được bắt đầu học trước đó",
          data: {
            blockId,
            lessonId,
            learningPathId: pathId,
            isCompleted: existingBlockProgress.isCompleted || false,
            maxWatchedTime: existingBlockProgress.maxWatchedTime || 0,
            videoDuration: existingBlockProgress.videoDuration || 0,
            videoUrl: block.videoUrl || null,
            duration: block.duration || null,
            lessonContent,
            isQuiz: hasQuiz,
          },
        });
      }

      // Nếu chưa có progress, tạo mới với trạng thái bắt đầu (isCompleted = false)
      // Sử dụng updateBlockProgress với maxWatchedTime = 0 để tạo block progress mới
      const progress = await UserProgressRepository.updateBlockProgress(
        userId,
        pathId,
        lessonId,
        blockId,
        0, // maxWatchedTime = 0 (chưa xem)
        0 // videoDuration = 0 (sẽ được cập nhật sau khi load video)
      );

      // Lấy block progress vừa tạo
      const newBlockProgress = progress.getBlockProgress(
        toObjectId(lessonId),
        toObjectId(blockId)
      );

      return ResponseBuilder.success({
        message: "Bắt đầu học block thành công",
        data: {
          blockId,
          lessonId,
          learningPathId: pathId,
          isCompleted: newBlockProgress?.isCompleted || false,
          maxWatchedTime: newBlockProgress?.maxWatchedTime || 0,
          videoDuration: newBlockProgress?.videoDuration || 0,
          videoUrl: block.videoUrl || null,
          duration: block.duration || null,
          lastAccessedAt: new Date(),
          lessonContent,
          isQuiz: hasQuiz,
        },
      });
    } catch (error) {
      // Nếu là AppError, throw lại để middleware xử lý
      if (error instanceof AppError) {
        throw error;
      }

      // Log và throw error khác
      console.error(
        `[BlockService] Error starting learning block ${req.params.blockId}:`,
        error
      );
      throw new AppError("Failed to start learning block", 500);
    }
  }

  /**
   * Kiểm tra và cập nhật lesson completion nếu tất cả blocks đã hoàn thành
   * @private
   * @param {String} userId - ID người dùng
   * @param {String} learningPathId - ID learning path
   * @param {String} lessonId - ID lesson
   */
  async _checkAndUpdateLessonCompletionIfNeeded(
    userId,
    learningPathId,
    lessonId
  ) {
    try {
      // Lấy lesson để có tổng số blocks
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      const totalBlocks = lesson?.blocks?.length || 0;

      // Chỉ check nếu lesson có blocks
      if (totalBlocks > 0) {
        const wasLessonCompleted =
          await UserProgressRepository.checkAndUpdateLessonCompletion(
            userId,
            learningPathId,
            lessonId,
            totalBlocks
          );

        if (wasLessonCompleted) {
          console.log(
            `[BlockService] Lesson ${lessonId} marked as completed for user ${userId}`
          );
        }
      }
    } catch (error) {
      // Log error nhưng không throw để không làm fail video heartbeat
      console.error(
        `[BlockService] Error checking lesson completion for lesson ${lessonId}:`,
        error
      );
    }
  }

  async createBlockContent(req) {
    const block = req.body;
    await this._ensureUniqueTitle(block.title, block.lessonId);
    const createdBlock = await BlockRepository.create(block);
    return ResponseBuilder.success({
      message: "Block created successfully",
      data: createdBlock,
    });
  }

  async updateBlockContent(req) {
    const { blockId } = req.params;
    const blockUpdates = req.body;
    const existingBlock = await this.existingBlock(blockId);

    // Check duplicate title when title is being changed
    if (
      blockUpdates.title &&
      blockUpdates.title.toLowerCase() !==
      (existingBlock.title || "").toLowerCase()
    ) {
      const lessonContext = blockUpdates.lessonId || existingBlock.lessonId;
      await this._ensureUniqueTitle(blockUpdates.title, lessonContext, blockId);
    }

    if (existingBlock.order !== blockUpdates.order) {
      await lessonBlockHelper.checkOrderExists(
        existingBlock,
        blockUpdates.order
      );
    }

    const updatedBlock = await BlockRepository.update(
      toObjectId(blockId),
      blockUpdates
    );
    return ResponseBuilder.success({
      message: "Block updated successfully",
      data: updatedBlock,
    });
  }

  async deleteBlockContent(req) {
    const { blockId } = req.params;
    await this.existingBlock(blockId);
    try {
      await lessonBlockHelper.deleteBlockFromLesson(blockId);
      await BlockRepository.softDelete(toObjectId(blockId));
      return ResponseBuilder.success("Block deleted successfully");
    } catch (error) {
      throw new AppError("Failed to remove block from lesson.", 500);
    }
  }
}
module.exports = new BlockService();
