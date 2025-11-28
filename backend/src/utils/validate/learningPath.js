import Joi from "joi";

export const assignTargetToPathSchema = Joi.object({
  targetId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "targetId must be a valid MongoDB ObjectId",
      "any.required": "targetId is required",
    }),
});



