import Joi from "joi";
import constants from "../../constants/status.constans.js";

const { STATUS } = constants;

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  nameVi: Joi.string().trim().max(150).required(),
  slug: Joi.string().trim().lowercase().optional(),
  description: Joi.string().trim().max(1000).optional(),
  icon: Joi.string().uri().optional(),
  color: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .optional(),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),

  // parentCategory: Joi.string()
  //   .regex(/^[0-9a-fA-F]{24}$/)
  //   .allow(null),
  // childCategories: Joi.array()
  //   .items(
  //     Joi.string()
  //       .regex(/^[0-9a-fA-F]{24}$/)
  //       .message("Each child category must be a valid MongoDB ObjectId")
  //   )
  //   .allow(null)
  //   .default([]),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),

  updatedAt: Joi.date().optional().allow(null),
  updatedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null),
});
