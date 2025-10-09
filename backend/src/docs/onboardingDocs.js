"use strict";

const onboardingDocs = {
  getOnboardingQuestions: {
    get: {
      summary: "Get all onboarding questions",
      description:
        "Retrieve all active onboarding questions to display for new users during setup.",
      tags: ["OnboardingQuestion"],
      security: [], 
      parameters: [],
      responses: {
        200: {
          description: "List of active onboarding questions retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                success: true,
                message: "Fetched onboarding questions successfully",
                data: [
                  {
                    key: "GOALS",
                    title: "What's your learning goal?",
                    description: "Choose one or more goals that fit you best",
                    type: "multiple",
                    options: [
                      {
                        key: "TRAVEL_ENGLISH",
                        label: "Travel English",
                        icon: "✈️",
                        description: "Learn English for traveling around the world",
                      },
                      {
                        key: "BUSINESS_ENGLISH",
                        label: "Business English",
                        icon: "💼",
                        description: "Improve your English for professional communication",
                      },
                    ],
                  },
                  {
                    key: "TIME_COMMITMENT",
                    title: "How much time can you commit daily?",
                    description: "Select how much time you can spend learning English each day",
                    type: "single",
                    options: [
                      {
                        key: "5_MINUTES",
                        label: "5 minutes",
                        icon: "⏱️",
                        description: "Quick daily practice for busy learners",
                      },
                      {
                        key: "15_MINUTES",
                        label: "15 minutes",
                        icon: "⌚",
                        description: "Perfect for steady daily progress",
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
        404: {
          description: "No onboarding questions found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                message: "No onboarding questions found",
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                message: "An unexpected error occurred while fetching onboarding questions",
              },
            },
          },
        },
      },
    },
  },
};

module.exports = onboardingDocs;
