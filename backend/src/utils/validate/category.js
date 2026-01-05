import Joi from "joi";
import constants from "../../constants/status.constans.js";

const { STATUS } = constants;

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  nameVi: Joi.string().trim().max(150).required(),
  slug: Joi.string().trim().lowercase().optional(),
  description: Joi.string().trim().max(1000).optional(),
});
