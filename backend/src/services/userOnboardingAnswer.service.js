"use strict";
const UserOnboardingAnswerRepo = require("../repositories/userOnboardingAnswer.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const AnswerMapService = require("../services/answerMap.service");
const DEFAULT_LEARNING_PATH_KEY = "DAILY_CONVERSATION_PATH";
const UserRepository = require("../repositories/user.repo");
const { ONBOARDING_STATUS } = require("../constants/status.constans");
const userLearningPathRepo = require("../repositories/userLearningPath.repo");
const TOTAL_QUESTIONS = 4;

class UserOnboardingAnswerService {
  async handleSaveAnswers(userId, answers) {
    if (!userId) return ResponseBuilder.badRequest("Vui lòng đăng nhập.");

    try {
      const user = await UserRepository.findById(userId, {
        select: "onboardingStatus",
      });
      if (!user)
        return ResponseBuilder.notFoundError("Không tìm thấy người dùng.");

      if (user.onboardingStatus === ONBOARDING_STATUS.COMPLETED) {
        return ResponseBuilder.badRequest("Bạn đã hoàn thành onboarding.");
      }

      let mapResult = {};

      if (
        user.onboardingStatus === ONBOARDING_STATUS.STARTED &&
        (!Array.isArray(answers) || answers.length < TOTAL_QUESTIONS)
      ) {
        mapResult = await this.assignDefaultPath(userId);
        await UserRepository.updateOnboardingStatus(
          userId,
          ONBOARDING_STATUS.COMPLETED
        );
      } else if (Array.isArray(answers) && answers.length === TOTAL_QUESTIONS) {
        const existingAnswers =
          await UserOnboardingAnswerRepo.getByUser(userId);
        if (existingAnswers && existingAnswers.length > 0)
          return ResponseBuilder.duplicateError(
            "Bạn đã trả lời onboarding trước đó."
          );

        const docs = answers.map((a) => ({
          user: userId,
          questionKey: a.questionKey?.toUpperCase(),
          answerKeys: a.answerKeys?.map((key) => key.toUpperCase()),
        }));

        const savedAnswers = await UserOnboardingAnswerRepo.insertMany(docs);
        if (!savedAnswers)
          return ResponseBuilder.badRequest("Lưu câu trả lời thất bại.");

        mapResult = await AnswerMapService.mapAnswerToTarget(userId, answers);
        console.log("mapResult", mapResult);

        await UserRepository.updateOnboardingStatus(
          userId,
          ONBOARDING_STATUS.COMPLETED
        );
      } else {
        return ResponseBuilder.badRequest(
          "Câu trả lời không hợp lệ hoặc user chưa nhấn start."
        );
      }

      const learningPath = await userLearningPathRepo.findByUserId(userId);
      const pathId =
        learningPath && learningPath.length > 0 ? learningPath[0]._id : "";
      if (!learningPath || learningPath.length === 0)
        return ResponseBuilder.notFoundError();

      return ResponseBuilder.success("Xử lý onboarding thành công", {
        learningPathId: pathId,
        ...mapResult,
      });
    } catch (error) {
      return ResponseBuilder.badRequest(
        "Lỗi trong quá trình xử lý câu trả lời."
      );
    }
  }

  async getAnswers(UserId) {
    const getAnswers = UserOnboardingAnswerRepo.getByUser(UserId);
    if (!getAnswers || getAnswers.length === 0)
      return ResponseBuilder.notFoundError();
    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.FETCHED,
      getAnswers
    );
  }

  async startOnboarding(userId) {
    if (!userId) return ResponseBuilder.badRequest("Vui lòng đăng nhập.");

    try {
      const user = await User.findById(userId);
      if (!user)
        return ResponseBuilder.notFoundError("Không tìm thấy người dùng.");

      if (user.onboardingStatus === ONBOARDING_STATUS.NOT_STARTED) {
        await UserRepository.updateOnboardingStatus(
          userId,
          ONBOARDING_STATUS.STARTED
        );
      } else if (user.onboardingStatus === ONBOARDING_STATUS.COMPLETED) {
        return ResponseBuilder.badRequest("User đã hoàn thành onboarding");
      }

      return ResponseBuilder.success("Onboarding started", {
        status: ONBOARDING_STATUS.STARTED,
      });
    } catch (error) {
      return ResponseBuilder.badRequest("Lỗi khi bắt đầu onboarding.");
    }
  }

  async assignDefaultPath(userId) {
    if (!userId) {
      throw new Error("userId là bắt buộc để gán lộ trình mặc định");
    }

    try {
      const existingPaths = await userLearningPathRepo.findByUserId(userId);

      if (existingPaths && existingPaths.length > 0) {
        return {
          success: true,
          status: "existing",
          pathId: existingPaths[0]._id,
        };
      }

      const newDefaultPath = {
        user: userId,
        learningPath: DEFAULT_LEARNING_PATH_KEY,
        assignedAt: new Date(),
        assignmentType: "default_onboarding_skip",
      };

      const createdPath = await userLearningPathRepo.create(newDefaultPath);

      if (!createdPath) {
        throw new Error("Không thể tạo bản ghi lộ trình mặc định trong CSDL.");
      }

      return { success: true, status: "created", newPathId: createdPath._id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserOnboardingAnswerService();
