"use strict";

const userOnboardingAnswerDocs = {
  // ✅ POST /v1/api/user-onboarding-answer
  save: {
    post: {
      summary: "Submit user onboarding answers",
      description: "Save user's onboarding answers (goals, time commitment, learning style, level).",
      tags: ["OnboardingAnswers"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              answers: [
                {
                  questionKey: "GOALS",
                  answerKeys: ["TRAVEL_ENGLISH"]
                },
                {
                  questionKey: "TIME_COMMITMENT",
                  answerKeys: ["15_MINUTES"]
                },
                {
                  questionKey: "LEARNING_STYLE",
                  answerKeys: ["VIDEO_BASED"]
                },
                {
                  questionKey: "LEVEL",
                  answerKeys: ["BEGINNER"]
                }
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: "Answers submitted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Answers saved successfully",
                metadata: {
                  savedCount: 4,
                  user: "6700a2b4e4c8a7d8b9d56f2a"
                }
              }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      }
    }
  },

  // ✅ GET /v1/api/user-onboarding-answer
  get: {
    get: {
      summary: "Get user's onboarding answers",
      description: "Retrieve all onboarding answers for the current authenticated user.",
      tags: ["OnboardingAnswers"],
      security: [{ bearerAuth: [] }],
      parameters: [],
      responses: {
        200: {
          description: "User onboarding answers retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "User onboarding answers fetched successfully",
                metadata: [
                  {
                    questionKey: "GOALS",
                    answerKeys: ["TRAVEL_ENGLISH", "BUSINESS_ENGLISH"],
                    answeredAt: "2025-10-05T09:32:00.000Z"
                  },
                  {
                    questionKey: "TIME_COMMITMENT",
                    answerKeys: ["15_MINUTES"],
                    answeredAt: "2025-10-05T09:32:00.000Z"
                  }
                ]
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    }
  },
};

module.exports = userOnboardingAnswerDocs;
